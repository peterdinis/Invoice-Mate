import connectToDB from "@/lib/auth/mongoose";
import Client from "@/models/Client";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { CustomError } from "@/types/ErrorType";

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    await connectToDB();

    const clientId = params.id;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    const body = await req.json();
    const { name, email, address } = body;

    const clientExists = await Client.findById(clientId);
    if (!clientExists) {
      console.log("Client not found for ID:", clientId);
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const updatedClient = await Client.findByIdAndUpdate(
      clientId,
      {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(address !== undefined && { address }),
      },
      { new: true },
    ).populate("invoices");

    return NextResponse.json(updatedClient, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      const customErr: CustomError = { message: err.message };
      return NextResponse.json({ error: customErr.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 400 });
  }
}
