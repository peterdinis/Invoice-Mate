import { NextRequest, NextResponse } from "next/server";
import Invoice from "@/models/Invoice";
import connectToDB from "@/lib/auth/mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectToDB();

    const searchParams = request.nextUrl.searchParams;
    const months = parseInt(searchParams.get("months") || "6");

    const now = new Date();
    const monthsData = [];

    // Získaj dáta pre posledných X mesiacov
    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const revenue = await Invoice.aggregate([
        {
          $match: {
            status: "paid",
            invoiceDate: {
              $gte: monthDate,
              $lt: nextMonth,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" },
          },
        },
      ]);

      // Formátuj názov mesiaca
      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "Máj", "Jún",
        "Júl", "Aug", "Sep", "Okt", "Nov", "Dec"
      ];

      monthsData.push({
        month: monthNames[monthDate.getMonth()],
        revenue: revenue[0]?.total || 0,
      });
    }

    return NextResponse.json(monthsData);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch monthly revenue", message: error.message },
      { status: 500 }
    );
  }
}