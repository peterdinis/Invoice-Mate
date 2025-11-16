import { NextRequest, NextResponse } from "next/server";
import Invoice, { IInvoice } from "@/models/Invoice";
import connectToDB from "@/lib/auth/mongoose";
import Folder from "@/models/Folder";
import { InvoiceFilter } from "@/types/ClientTypes";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
let dbConnected = false;

async function ensureConnection() {
  if (!dbConnected) {
    await connectToDB();
    dbConnected = true;
  }
}

function buildSearchFilter(searchTerm: string, folderId: string | null): InvoiceFilter {
  const filter: InvoiceFilter = {};

  if (folderId) {
    filter.folder = folderId;
  }

  if (searchTerm) {
    filter.$or = [
      { invoiceNumber: { $regex: `^${searchTerm}`, $options: "i" } },
      { "client.name": { $regex: searchTerm, $options: "i" } },
      { "client.email": { $regex: searchTerm, $options: "i" } },
    ];
  }

  return filter;
}

export async function GET(req: NextRequest) {
  try {
    await ensureConnection();

    const { searchParams } = new URL(req.url);
    const page = Math.max(DEFAULT_PAGE, parseInt(searchParams.get("page") || String(DEFAULT_PAGE), 10));
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10)));
    const folderId = searchParams.get("folderId");
    const searchTerm = (searchParams.get("search") || "").trim();
    const skip = (page - 1) * limit;

    const filter = buildSearchFilter(searchTerm, folderId);

    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .select("invoiceNumber status total dueDate invoiceDate createdAt updatedAt")
        .populate({
          path: "client",
          select: "name email address", 
        })
        .populate({
          path: "folder",
          select: "name color", 
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .maxTimeMS(10000),
      
      Invoice.countDocuments(filter)
    ]);

    return NextResponse.json({
      invoices,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    }, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error: any) {
    console.error("Error fetching invoices:", error);
    dbConnected = false;

    if (error.name === 'MongoNetworkError') {
      return NextResponse.json(
        { message: "Database connection failed" },
        { status: 503 }
      );
    }

    if (error.message.includes('timeout')) {
      return NextResponse.json(
        { message: "Request timeout - try refining your search" },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureConnection();
    
    const body: Partial<IInvoice> = await req.json();

    if (!body.invoiceNumber || !body.client || !body.total) {
      return NextResponse.json(
        { message: "Invoice number, client and total are required" },
        { status: 400 }
      );
    }

    const existingInvoice = await Invoice.findOne({ 
      invoiceNumber: body.invoiceNumber 
    }).select('_id').lean();

    if (existingInvoice) {
      return NextResponse.json(
        { message: "Invoice with this number already exists" },
        { status: 409 }
      );
    }

    if (body.folder) {
      const folderExists = await Folder.findById(body.folder).select('_id').lean();
      if (!folderExists) {
        return NextResponse.json(
          { message: "Folder not found" },
          { status: 404 }
        );
      }
    }

    const newInvoice = await Invoice.create({
      ...body,
      status: body.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    const responseInvoice = await Invoice.findById(newInvoice._id)
      .select("invoiceNumber status total dueDate invoiceDate client folder createdAt")
      .populate({
        path: "client",
        select: "name email",
      })
      .populate({
        path: "folder", 
        select: "name",
      })
      .lean();

    return NextResponse.json(responseInvoice, { 
      status: 201,
      headers: {
        'Location': `/api/invoices/${newInvoice._id}`
      }
    });

  } catch (error: any) {
    console.error("Error creating invoice:", error);
    dbConnected = false;

    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { message: "Invalid invoice data" },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { message: "Invoice number already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}