import { NextResponse } from "next/server";
import Client from "@/models/Client";
import connectToDB from "@/lib/auth/mongoose";

export async function GET() {
  try {
    await connectToDB();

    const clients = await Client.find({}).select("name email address").lean();

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}