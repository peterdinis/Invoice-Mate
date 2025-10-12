import { NextRequest, NextResponse } from "next/server";
import Client from "@/models/Client";
import connectToDB from "@/lib/mongoose";

export async function GET(req: NextRequest) {
  await connectToDB();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  const [clients, total] = await Promise.all([
    Client.find().skip(skip).limit(limit),
    Client.countDocuments(),
  ]);

  return NextResponse.json({
    data: clients,
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
