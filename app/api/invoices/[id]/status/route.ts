import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/auth/mongoose";
import Invoice, { InvoiceStatus } from "@/models/Invoice";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();

    const invoiceId = params.id;
    const body = await req.json();
    const { status } = body;
    
    if (!Object.values(InvoiceStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid invoice status" },
        { status: 400 }
      );
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { status },
      { new: true }
    )
      .populate("client", "name email")
      .lean();

    if (!updatedInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(updatedInvoice, { status: 200 });
  } catch (error) {
    console.error("Error updating invoice status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}