import { NextRequest, NextResponse } from 'next/server';
import Invoice from '@/models/Invoice';
import connectToDB from '@/lib/auth/mongoose';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    
    const invoiceId = params.id;
    const body = await req.json();
    const { status } = body;

    // Validácia statusu
    const validStatuses = ['draft', 'pending', 'paid', 'overdue'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid invoice status" },
        { status: 400 }
      );
    }

    // Nájdite a aktualizujte faktúru
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedInvoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedInvoice, { status: 200 });

  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}