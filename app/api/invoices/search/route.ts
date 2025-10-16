import { NextResponse } from "next/server";
import Invoice from "@/models/Invoice";
import connectToDB from "@/lib/auth/mongoose";
import { CustomError } from "@/types/ErrorType";

export async function GET(req: Request) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    const invoices = await Invoice.find({
      $or: [
        { clientName: { $regex: query, $options: "i" } },
        { invoiceNumber: { $regex: query, $options: "i" } },
      ],
    })
      .populate("client folder")
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json(invoices);
  } catch (err: unknown) {
      if (err instanceof Error) {
        const customErr: CustomError = { message: err.message };
        return NextResponse.json({ error: customErr.message }, { status: 400 });
      }
      return NextResponse.json({ error: "Unknown error" }, { status: 400 });
    }
}
