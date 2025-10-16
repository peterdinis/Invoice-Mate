import { NextRequest, NextResponse } from "next/server";
import Client from "@/models/Client";
import connectToDB from "@/lib/auth/mongoose";
import { IInvoice } from "@/models/Invoice";

interface ClientWithInvoices {
  _id: string;
  name: string;
  email: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
  invoices: IInvoice[];
  invoiceCount: number;
}

export async function GET(req: NextRequest) {
  await connectToDB();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const searchTerm = searchParams.get("search") || "";
  const skip = (page - 1) * limit;

  const filter = searchTerm
    ? {
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
      ],
    }
    : {};

  const clientsWithInvoiceCount: ClientWithInvoices[] = await Client.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "invoices",
        localField: "_id",
        foreignField: "client",
        as: "invoices",
      },
    },
    {
      $addFields: {
        invoiceCount: { $size: "$invoices" },
      },
    },
    { $skip: skip },
    { $limit: limit },
  ]);

  const total = await Client.countDocuments(filter);

  return NextResponse.json({
    data: clientsWithInvoiceCount,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
}

export async function POST(req: NextRequest) {
  await connectToDB();
  const body = await req.json();
  const { name, email, address } = body;

  try {
    const newClient = await Client.create({ name, email, address });
    return NextResponse.json(newClient, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
