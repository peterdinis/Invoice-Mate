import { NextRequest, NextResponse } from "next/server";
import Invoice, { IInvoice } from "@/models/Invoice";
import connectToDB from "@/lib/auth/mongoose";
import Folder from "@/models/Folder";
import { InvoiceFilter } from "@/types/ClientTypes";

export async function GET(req: NextRequest) {
  await connectToDB();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const folderId = searchParams.get("folderId") || null;
  const searchTerm = searchParams.get("search") || "";
  const skip = (page - 1) * limit;

  const filter: InvoiceFilter = {};

  if (folderId) {
    filter.folder = folderId;
  }

  if (searchTerm) {
    filter.$or = [
      { invoiceNumber: { $regex: searchTerm, $options: "i" } },
      { "client.name": { $regex: searchTerm, $options: "i" } },
      { "client.email": { $regex: searchTerm, $options: "i" } },
    ];
  }

  const invoices = await Invoice.find(filter)
    .populate("client")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Invoice.countDocuments(filter);

  return NextResponse.json({
    invoices,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    await connectToDB();
    const body: Partial<IInvoice> = await req.json();

    const folderExists = await Folder.findById(body.folder);
    if (!folderExists) {
      return NextResponse.json(
        { message: "Folder not found" },
        { status: 404 },
      );
    }

    const newInvoice = await Invoice.create(body);
    return NextResponse.json(newInvoice, { status: 201 });
  } catch (err: unknown) {
    console.error(err);
    if (err instanceof Error) {
      return NextResponse.json({ message: err.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Unknown error" }, { status: 500 });
  }
}
