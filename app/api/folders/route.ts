import { NextResponse } from "next/server";
import Folder from "@/models/Folder";
import connectToDB from "@/lib/auth/mongoose";

let dbConnected = false;
const MAX_RETRIES = 2;

async function ensureConnection() {
  if (!dbConnected) {
    await connectToDB();
    dbConnected = true;
  }
}

export async function GET(request: Request) {
  let retries = 0;
  
  while (retries <= MAX_RETRIES) {
    try {
      await ensureConnection();

      const url = new URL(request.url);
      const limit = Math.min(1000, parseInt(url.searchParams.get("limit") || "50"));
      const withDocuments = url.searchParams.get("withDocuments") === "true";

      const query = Folder.find()
        .select(withDocuments ? "name description createdAt documents" : "name description createdAt")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      if (withDocuments) {
        query.populate({
          path: "documents",
          select: "name size createdAt",
          options: { sort: { createdAt: -1 }, limit: 20 }
        });
      }

      const folders = await query;

      return NextResponse.json(folders, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      });

    } catch (error) {
      retries++;
      dbConnected = false;
      
      if (retries > MAX_RETRIES) {
        console.error("Chyba pri načítaní priečinkov:", error);
        return NextResponse.json(
          { error: "Nepodarilo sa načítať priečinky" },
          { status: 500 },
        );
      }

      await new Promise(resolve => setTimeout(resolve, 100 * retries));
    }
  }
}

export async function POST(req: Request) {
  try {
    await ensureConnection();

    const { name, description } = await req.json();

    const folderName = name?.trim();
    if (!folderName) {
      return NextResponse.json(
        { error: "Názov priečinka je povinný" },
        { status: 400 }
      );
    }

    const existingFolder = await Folder.findOne({ 
      name: { $regex: `^${folderName}$`, $options: 'i' }
    }).select('_id').lean();

    if (existingFolder) {
      return NextResponse.json(
        { error: "Priečinok s týmto názvom už existuje" },
        { status: 409 }
      );
    }

    const newFolder = await Folder.create({ 
      name: folderName, 
      description: description?.trim() || "" 
    });

    return NextResponse.json({
      _id: newFolder._id,
      name: newFolder.name,
      description: newFolder.description,
      createdAt: newFolder.createdAt
    }, { 
      status: 201,
      headers: {
        'Location': `/api/folders/${newFolder._id}`
      }
    });

  } catch (error: any) {
    console.error("Chyba pri vytváraní priečinka:", error);
    dbConnected = false;
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: "Neplatné údaje pre priečinok" },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Priečinok s týmto názvom už existuje" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Nepodarilo sa vytvoriť priečinok" },
      { status: 500 },
    );
  }
}