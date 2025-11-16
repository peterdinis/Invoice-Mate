import { NextResponse } from "next/server";
import Invoice from "@/models/Invoice";
import connectToDB from "@/lib/auth/mongoose";
import { CustomError } from "@/types/ErrorType";

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 50;
let dbConnected = false;

async function ensureConnection() {
  if (!dbConnected) {
    await connectToDB();
    dbConnected = true;
  }
}

export async function GET(request: Request) {
  try {
    await ensureConnection();

    const url = new URL(request.url);
    const limit = Math.min(
      MAX_LIMIT,
      parseInt(url.searchParams.get("limit") || String(DEFAULT_LIMIT)),
    );
    const includeItems = url.searchParams.get("includeItems") === "true";

    const invoices = await Invoice.find()
      .select(
        "invoiceNumber status total dueDate invoiceDate createdAt updatedAt",
      )
      .populate({
        path: "client",
        select: "name email",
      })
      .populate({
        path: "folder",
        select: "name",
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    let invoicesWithItems = invoices;
    if (includeItems) {
      const invoiceIds = invoices.map((inv) => inv._id);
      const itemsByInvoice = await Invoice.aggregate([
        {
          $match: { _id: { $in: invoiceIds } },
        },
        {
          $project: {
            _id: 1,
            items: 1,
          },
        },
      ]);

      invoicesWithItems = invoices.map((invoice) => ({
        ...invoice,
        items:
          itemsByInvoice.find((item) => item._id.equals(invoice._id))?.items ||
          [],
      }));
    }

    return NextResponse.json(invoicesWithItems, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (err: unknown) {
    console.error("Error fetching invoices:", err);
    dbConnected = false;

    if (err instanceof Error) {
      if (err.name === "MongoNetworkError") {
        return NextResponse.json(
          { error: "Database connection failed" },
          { status: 503 },
        );
      }

      const customErr: CustomError = { message: err.message };
      return NextResponse.json({ error: customErr.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
