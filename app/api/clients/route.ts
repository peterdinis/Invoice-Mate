import { NextRequest, NextResponse } from "next/server";
import Client from "@/models/Client";
import connectToDB from "@/lib/auth/mongoose";

export async function GET(req: NextRequest) {
  await connectToDB();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const searchTerm = searchParams.get("searchTerm") || "";
  const skip = (page - 1) * limit;

  // Filter for searchTerm on name/email
  const filter = searchTerm
    ? {
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { email: { $regex: searchTerm, $options: "i" } },
        ],
      }
    : {};

  // Use aggregation to include invoice count
  const clientsWithInvoiceCount = await Client.aggregate([
    { $match: filter }, // apply search filter
    {
      $lookup: {
        from: "invoices", // MongoDB collection name
        localField: "_id",
        foreignField: "client",
        as: "invoices",
      },
    },
    {
      $addFields: {
        invoiceCount: { $size: "$invoices" }, // count invoices
      },
    },
    { $skip: skip },
    { $limit: limit },
  ]);

  // Get total count for pagination
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
