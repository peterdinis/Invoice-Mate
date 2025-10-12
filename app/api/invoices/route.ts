import { NextResponse } from "next/server";
import Invoice from "@/models/Invoice";
import Folder from "@/models/Folder";
import connectToDB from "@/lib/mongoose";

export async function GET() {
  try {
    await connectToDB();
    const invoices = await Invoice.find().populate("folder").sort({ createdAt: -1 });
    return NextResponse.json(invoices, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();

    const folderExists = await Folder.findById(body.folder);
    if (!folderExists) {
      return NextResponse.json({ message: "Folder not found" }, { status: 404 });
    }

    const newInvoice = await Invoice.create(body);
    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to create invoice" }, { status: 500 });
  }
}