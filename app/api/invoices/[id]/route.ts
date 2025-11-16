import { NextRequest, NextResponse } from "next/server";
import Invoice from "@/models/Invoice";
import connectToDB from "@/lib/auth/mongoose";

// Cache pre platné statusy a pripojenie
const VALID_STATUSES = ["draft", "pending", "paid", "overdue"] as const;
type InvoiceStatus = typeof VALID_STATUSES[number];
let dbConnected = false;

async function ensureConnection() {
  if (!dbConnected) {
    await connectToDB();
    dbConnected = true;
  }
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    // Paralelné spracovanie parametrov a pripojenia
    const [params, body] = await Promise.all([
      props.params,
      req.json()
    ]);

    await ensureConnection();

    const invoiceId = params.id;

    // Rýchla validácia ObjectId
    if (!invoiceId || invoiceId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(invoiceId)) {
      return NextResponse.json(
        { error: "Neplatné ID faktúry" },
        { status: 400 },
      );
    }

    const { status, paidAt, notes } = body;
    const statusUpdate = status as InvoiceStatus;

    // Validácia statusu
    if (!VALID_STATUSES.includes(statusUpdate)) {
      return NextResponse.json(
        { 
          error: "Neplatný status faktúry", 
          validStatuses: VALID_STATUSES 
        },
        { status: 400 },
      );
    }

    // Príprava updatov s automatickými dátumami
    const updateData: any = { 
      status: statusUpdate,
      updatedAt: new Date()
    };

    // Automatické nastavenie paidAt ak sa mení na 'paid'
    if (statusUpdate === 'paid' && !paidAt) {
      updateData.paidAt = new Date();
    } else if (paidAt) {
      updateData.paidAt = paidAt;
    }

    // Pridanie notes ak sú poskytnuté
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Optimalizovaný update s projekciou
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      updateData,
      { 
        new: true, 
        runValidators: true,
        // Iba potrebné polia pre lepší výkon
        select: "invoiceNumber status amount client dueDate paidAt notes createdAt updatedAt"
      }
    ).lean(); // lean() pre rýchlejšiu odpoveď

    if (!updatedInvoice) {
      return NextResponse.json(
        { error: "Faktúra nebola nájdená" },
        { status: 404 },
      );
    }

    // Cache headers pre lepší výkon
    return NextResponse.json(updatedInvoice, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache', // Faktúry sú často menené
      },
    });

  } catch (error: any) {
    console.error("Chyba pri aktualizácii faktúry:", error);
    dbConnected = false;

    // Špecifické error handling
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: "Neplatné údaje pre faktúru" },
        { status: 400 },
      );
    }

    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: "Neplatný formát ID" },
        { status: 400 },
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Duplicitná faktúra" },
        { status: 409 },
      );
    }

    // Network/timeout errors
    if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
      return NextResponse.json(
        { error: "Problém s pripojením k databáze" },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Interná chyba servera" },
      { status: 500 },
    );
  }
}