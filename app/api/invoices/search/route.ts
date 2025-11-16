import { NextResponse } from "next/server";
import Invoice from "@/models/Invoice";
import connectToDB from "@/lib/auth/mongoose";
import { CustomError } from "@/types/ErrorType";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 100;
let dbConnected = false;

async function ensureConnection() {
  if (!dbConnected) {
    await connectToDB();
    dbConnected = true;
  }
}

export async function GET(req: Request) {
  try {
    await ensureConnection();
    
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || "").trim();
    const limit = Math.min(
      MAX_LIMIT,
      parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT))
    );

    if (query.length < MIN_QUERY_LENGTH) {
      return NextResponse.json(
        { error: `Query must be at least ${MIN_QUERY_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (query.length > MAX_QUERY_LENGTH) {
      return NextResponse.json(
        { error: `Query too long (max ${MAX_QUERY_LENGTH} characters)` },
        { status: 400 }
      );
    }

    const searchFilter = {
      $or: [
        { clientName: { $regex: `^${query}`, $options: "i" } },
        { invoiceNumber: { $regex: query, $options: "i" } },
      ],
    };

    const invoices = await Invoice.find(searchFilter)
      .select("invoiceNumber status total dueDate invoiceDate clientName createdAt")
      .populate({
        path: "client",
        select: "name email phone",
      })
      .populate({
        path: "folder",
        select: "name color",
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .maxTimeMS(5000);

    return NextResponse.json({
      data: invoices,
      meta: {
        count: invoices.length,
        hasMore: invoices.length === limit,
        query: query
      }
    }, {
      headers: {
        'Cache-Control': query ? 'no-cache' : 'public, s-maxage=60',
      },
    });

  } catch (err: unknown) {
    console.error("Error searching invoices:", err);
    dbConnected = false;

    if (err instanceof Error) {
      if (err.name === 'MongoNetworkError') {
        return NextResponse.json(
          { error: "Database connection failed" },
          { status: 503 }
        );
      }

      if (err.message.includes('timeout')) {
        return NextResponse.json(
          { error: "Search timeout - try a more specific query" },
          { status: 408 }
        );
      }

      const customErr: CustomError = { message: err.message };
      return NextResponse.json(
        { error: customErr.message }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}