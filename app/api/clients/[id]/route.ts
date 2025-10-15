import connectToDB from "@/lib/auth/mongoose";
import Client from "@/models/Client";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();

    const clientId = params.id;

    console.log("ClientId", clientId);

    // 1️⃣ Skontroluj validitu ObjectId
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json(
        { error: "Invalid client ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, email, address } = body;

    // 2️⃣ Skontroluj, či klient existuje
    const clientExists = await Client.findById(clientId);
    if (!clientExists) {
      console.log("Client not found for ID:", clientId);
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // 3️⃣ Aktualizácia klienta
    const updatedClient = await Client.findByIdAndUpdate(
      clientId,
      {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(address !== undefined && { address }),
      },
      { new: true } // vráti aktualizovaný dokument
    ).populate("invoices"); // ak chceš mať invoices priamo vo výsledku

    return NextResponse.json(updatedClient, { status: 200 });
  } catch (error: any) {
    console.error("Error updating client:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
