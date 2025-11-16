import { NextRequest, NextResponse } from "next/server";
import Client from "@/models/Client";
import connectToDB from "@/lib/auth/mongoose";
import { CustomError } from "@/types/ErrorType";
import { ClientWithInvoices } from "@/types/ClientTypes";

// Cache for database connection
let dbConnected = false;

// Default pagination constants
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export async function GET(req: NextRequest) {
  try {
    // Connection management
    if (!dbConnected) {
      await connectToDB();
      dbConnected = true;
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(
      DEFAULT_PAGE,
      parseInt(searchParams.get("page") || String(DEFAULT_PAGE), 10),
    );
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(
        1,
        parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10),
      ),
    );
    const searchTerm = searchParams.get("search")?.trim() || "";
    const skip = (page - 1) * limit;

    // Build filter efficiently
    let filter = {};
    if (searchTerm) {
      filter = {
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { email: { $regex: searchTerm, $options: "i" } },
        ],
      };
    }

    // Execute aggregation and count in parallel
    const [clientsWithInvoiceCount, total] = await Promise.all([
      Client.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "invoices",
            localField: "_id",
            foreignField: "client",
            as: "invoices",
          },
        },
        {
          $project: {
            name: 1,
            email: 1,
            address: 1,
            invoiceCount: { $size: "$invoices" },
            // Include other client fields you need
            createdAt: 1,
            updatedAt: 1,
          },
        },
        { $skip: skip },
        { $limit: limit },
      ]),
      Client.countDocuments(filter),
    ]);

    return NextResponse.json({
      data: clientsWithInvoiceCount,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    dbConnected = false;
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Connection management
    if (!dbConnected) {
      await connectToDB();
      dbConnected = true;
    }

    const body = await req.json();
    const { name, email, address } = body;

    // Validation
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 },
      );
    }

    // Check for existing email concurrently with other operations
    const [existingClient] = await Promise.all([
      Client.findOne({ email: email.trim().toLowerCase() })
        .select("_id")
        .lean(),
      // Add any other async operations you might need
    ]);

    if (existingClient) {
      return NextResponse.json(
        { error: "Client with this email already exists" },
        { status: 409 },
      );
    }

    // Create new client
    const newClient = await Client.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      address: address?.trim() || "",
    });

    // Return minimal response for better performance
    return NextResponse.json(
      {
        _id: newClient._id,
        name: newClient.name,
        email: newClient.email,
        address: newClient.address,
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    console.error("Error creating client:", err);
    dbConnected = false;

    if (err instanceof Error) {
      // Handle MongoDB duplicate key error
      if (
        err.message.includes("E11000") ||
        err.message.includes("duplicate key")
      ) {
        return NextResponse.json(
          { error: "Client with this email already exists" },
          { status: 409 },
        );
      }

      // Handle validation errors
      if (err.name === "ValidationError") {
        return NextResponse.json(
          { error: "Validation failed - check your input data" },
          { status: 400 },
        );
      }

      const customErr: CustomError = { message: err.message };
      return NextResponse.json({ error: customErr.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
