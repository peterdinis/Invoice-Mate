import { NextResponse } from "next/server";
import Invoice, { InvoiceStatus } from "@/models/Invoice";
import connectToDB from "@/lib/auth/mongoose";

export async function GET() {
  try {
    await connectToDB();

    const paidCount = await Invoice.countDocuments({
      status: InvoiceStatus.PAID,
    });

    const pendingCount = await Invoice.countDocuments({
      status: InvoiceStatus.PENDING,
    });

    const overdueCount = await Invoice.countDocuments({
      status: InvoiceStatus.OVERDUE,
    });

    const total = paidCount + pendingCount + overdueCount;

    const data = [
      {
        name: "Zaplatené",
        value: paidCount,
        percentage: total > 0 ? Math.round((paidCount / total) * 100) : 0,
        color: "#22c55e",
      },
      {
        name: "Čakajúce",
        value: pendingCount,
        percentage: total > 0 ? Math.round((pendingCount / total) * 100) : 0,
        color: "#eab308",
      },
      {
        name: "Po splatnosti",
        value: overdueCount,
        percentage: total > 0 ? Math.round((overdueCount / total) * 100) : 0,
        color: "#ef4444",
      },
    ];

    return NextResponse.json({ data, total });
  } catch (error) {
    console.error("Error fetching invoice status counts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
