import { NextResponse } from "next/server";
import Invoice from "@/models/Invoice";
import connectToDB from "@/lib/auth/mongoose";
import { CustomError } from "@/types/ErrorType";

export async function GET() {
  try {
    await connectToDB();

    const invoices = await Invoice.find()
      .populate("client folder")
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json(invoices);
  } catch (err: unknown) {
    if (err instanceof Error) {
      const customErr: CustomError = { message: err.message };
      return NextResponse.json({ error: customErr.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 400 });
  }
}
