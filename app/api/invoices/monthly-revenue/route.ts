import { NextRequest, NextResponse } from "next/server";
import Invoice from "@/models/Invoice";
import connectToDB from "@/lib/auth/mongoose";
import { CustomError } from "@/types/ErrorType";

export async function GET(request: NextRequest) {
  try {
    await connectToDB();

    const searchParams = request.nextUrl.searchParams;
    const months = parseInt(searchParams.get("months") || "6");

    const now = new Date();
    const monthsData = [];
    
    for (let i = 0; i < months; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);

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

      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Máj",
        "Jún",
        "Júl",
        "Aug",
        "Sep",
        "Okt",
        "Nov",
        "Dec",
      ];

      monthsData.push({
        month: monthNames[monthDate.getMonth()],
        revenue: revenue[0]?.total || 0,
      });
    }

    return NextResponse.json(monthsData);
  } catch (err: unknown) {
    if (err instanceof Error) {
      const customErr: CustomError = { message: err.message };
      return NextResponse.json({ error: customErr.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 400 });
  }
}
