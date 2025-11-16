import { NextRequest, NextResponse } from "next/server";
import Invoice from "@/models/Invoice";
import connectToDB from "@/lib/auth/mongoose";
import { CustomError } from "@/types/ErrorType";

const MONTH_NAMES = [
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
const DEFAULT_MONTHS = 6;
const MAX_MONTHS = 24;
let dbConnected = false;

async function ensureConnection() {
  if (!dbConnected) {
    await connectToDB();
    dbConnected = true;
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureConnection();

    const searchParams = request.nextUrl.searchParams;
    const months = Math.min(
      MAX_MONTHS,
      Math.max(
        1,
        parseInt(searchParams.get("months") || String(DEFAULT_MONTHS)),
      ),
    );

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const revenueData = await Invoice.aggregate([
      {
        $match: {
          status: "paid",
          invoiceDate: {
            $gte: new Date(currentYear, currentMonth - months + 1, 1),
            $lt: new Date(currentYear, currentMonth + 1, 1),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$invoiceDate" },
            month: { $month: "$invoiceDate" },
          },
          total: { $sum: "$total" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          revenue: "$total",
          invoiceCount: "$count",
        },
      },
    ]);

    const monthsData = [];
    for (let i = 0; i < months; i++) {
      const targetDate = new Date(currentYear, currentMonth - i, 1);
      const targetYear = targetDate.getFullYear();
      const targetMonth = targetDate.getMonth() + 1;

      const foundData = revenueData.find(
        (item) => item.year === targetYear && item.month === targetMonth,
      );

      monthsData.unshift({
        month: MONTH_NAMES[targetDate.getMonth()],
        year: targetYear,
        revenue: foundData?.revenue || 0,
        invoiceCount: foundData?.invoiceCount || 0,
      });
    }

    return NextResponse.json(monthsData, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=150",
      },
    });
  } catch (err: unknown) {
    console.error("Error fetching revenue data:", err);
    dbConnected = false;

    if (err instanceof Error) {
      if (err.name === "MongoNetworkError") {
        return NextResponse.json(
          { error: "Database connection failed" },
          { status: 503 },
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
