import { NextResponse } from "next/server";
import Folder from "@/models/Folder";
import connectToDB from "@/lib/auth/mongoose";

export async function GET() {
  try {
    await connectToDB();
    const folders = await Folder.find().sort({ createdAt: -1 });
    return NextResponse.json(folders);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDB();
    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const newFolder = await Folder.create({ name, description });
    return NextResponse.json(newFolder, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 },
    );
  }
}
