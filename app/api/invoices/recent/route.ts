import { NextResponse } from "next/server";
import Invoice from "@/models/Invoice";
import connectToDB from "@/lib/auth/mongoose";

export async function GET() {
  try {
    await connectToDB();

    const invoices = await Invoice.find()
      .populate("client folder")
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json(invoices);
  } catch (error: any) {
    console.error("Recent error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
