import connectToDB from "@/lib/auth/mongoose";
import Client from "@/models/Client";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { CustomError } from "@/types/ErrorType";

// Cache for ObjectId validation (optional but can help with repeated calls)
const validObjectIdCache = new Map<string, boolean>();

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  
  try {
    // Start database connection and ID validation in parallel
    const [_, clientId] = await Promise.all([
      connectToDB(),
      params.id
    ]);

    // Fast ObjectId validation with caching
    let isValidId = validObjectIdCache.get(clientId);
    if (isValidId === undefined) {
      isValidId = mongoose.Types.ObjectId.isValid(clientId);
      validObjectIdCache.set(clientId, isValidId);
      // Optional: limit cache size to prevent memory leaks
      if (validObjectIdCache.size > 1000) {
        const firstKey = validObjectIdCache.keys().next().value;
        validObjectIdCache.delete(firstKey as unknown as string);
      }
    }

    if (!isValidId) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    // Parse body and check client existence in parallel
    const [body, clientExists] = await Promise.all([
      req.json(),
      Client.findById(clientId).select('_id').lean() // Only fetch _id for existence check
    ]);

    if (!clientExists) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const { name, email, address } = body;
    
    // Build update object only with provided fields
    const updateFields: Record<string, any> = {};
    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (address !== undefined) updateFields.address = address;

    // If no valid fields to update, return early
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    // Perform update without population first (faster), then populate if needed
    const updatedClient = await Client.findByIdAndUpdate(
      clientId,
      updateFields,
      { new: true, runValidators: true }
    );

    // Only populate if invoices are needed in response
    if (updatedClient && updatedClient.invoices?.length > 0) {
      await updatedClient.populate('invoices');
    }

    return NextResponse.json(updatedClient, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      // More specific error handling
      if (err.name === 'ValidationError') {
        return NextResponse.json({ error: "Validation failed" }, { status: 400 });
      }
      if (err.name === 'CastError') {
        return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
      }
      
      const customErr: CustomError = { message: err.message };
      return NextResponse.json({ error: customErr.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 400 });
  }
}