import { NextRequest, NextResponse } from "next/server";
import Invoice from "@/models/Invoice";
import connectToDB from "@/lib/auth/mongoose";
import { CustomError } from "@/types/ErrorType";

let dbConnected = false;
const CACHE_DURATION = 5 * 60 * 1000;
let cache: { data: any; timestamp: number } | null = null;

async function ensureConnection() {
  if (!dbConnected) {
    await connectToDB();
    dbConnected = true;
  }
}

function getMonthDates(now: Date = new Date()) {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
  const lastDayOfLastMonth = new Date(currentYear, currentMonth, 0);
  
  return {
    firstDayOfMonth,
    lastDayOfMonth,
    firstDayOfLastMonth,
    lastDayOfLastMonth
  };
}

export async function GET(request: NextRequest) {
  try {
    // Check cache first
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      return NextResponse.json(cache.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=300',
          'X-Data-Source': 'cache'
        }
      });
    }

    await ensureConnection();

    const now = new Date();
    const { firstDayOfMonth, lastDayOfMonth, firstDayOfLastMonth, lastDayOfLastMonth } = getMonthDates(now);

    const stats = await Invoice.aggregate([
      {
        $facet: {
          // Revenue statistics
          totalRevenue: [
            { $match: { status: "paid" } },
            { $group: { _id: null, total: { $sum: "$total" } } }
          ],
          thisMonthRevenue: [
            {
              $match: {
                status: "paid",
                invoiceDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
              }
            },
            { $group: { _id: null, total: { $sum: "$total" } } }
          ],
          lastMonthRevenue: [
            {
              $match: {
                status: "paid",
                invoiceDate: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth }
              }
            },
            { $group: { _id: null, total: { $sum: "$total" } } }
          ],
          // Invoice counts
          totalInvoices: [
            { $count: "count" }
          ],
          thisMonthInvoices: [
            {
              $match: {
                invoiceDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
              }
            },
            { $count: "count" }
          ],
          lastMonthInvoices: [
            {
              $match: {
                invoiceDate: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth }
              }
            },
            { $count: "count" }
          ],
          paidInvoicesThisMonth: [
            {
              $match: {
                status: "paid",
                invoiceDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
              }
            },
            { $count: "count" }
          ]
        }
      }
    ]);

    const [
      totalRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      totalInvoices,
      thisMonthInvoices,
      lastMonthInvoices,
      paidInvoicesThisMonth
    ] = stats[0];

    // Extract values
    const totalRevenueAmount = totalRevenue[0]?.total || 0;
    const thisMonthAmount = thisMonthRevenue[0]?.total || 0;
    const lastMonthAmount = lastMonthRevenue[0]?.total || 0;
    const totalInvoicesCount = totalInvoices[0]?.count || 0;
    const thisMonthInvoicesCount = thisMonthInvoices[0]?.count || 0;
    const lastMonthInvoicesCount = lastMonthInvoices[0]?.count || 0;
    const paidInvoicesCount = paidInvoicesThisMonth[0]?.count || 0;

    // Calculate changes
    const revenueChange = lastMonthAmount > 0 
      ? ((thisMonthAmount - lastMonthAmount) / lastMonthAmount) * 100 
      : thisMonthAmount > 0 ? 100 : 0;

    const invoiceChange = lastMonthInvoicesCount > 0
      ? ((thisMonthInvoicesCount - lastMonthInvoicesCount) / lastMonthInvoicesCount) * 100
      : thisMonthInvoicesCount > 0 ? 100 : 0;

    const responseData = {
      totalRevenue: totalRevenueAmount,
      revenueChange: Math.round(revenueChange * 10) / 10, // Better than toFixed
      totalInvoices: totalInvoicesCount,
      invoiceChange: Math.round(invoiceChange * 10) / 10,
      thisMonthRevenue: thisMonthAmount,
      thisMonthInvoices: thisMonthInvoicesCount,
      paidInvoicesThisMonth: paidInvoicesCount,
      lastMonthRevenue: lastMonthAmount,
      lastMonthInvoices: lastMonthInvoicesCount,
      updatedAt: now.toISOString()
    };

    // Update cache
    cache = {
      data: responseData,
      timestamp: Date.now()
    };

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=150',
        'X-Data-Source': 'database'
      }
    });

  } catch (err: unknown) {
    console.error("Error fetching dashboard stats:", err);
    dbConnected = false;

    // Return cached data even if stale as fallback
    if (cache) {
      console.log("Returning stale cached data due to error");
      return NextResponse.json(cache.data, {
        headers: {
          'Cache-Control': 'no-cache',
          'X-Data-Source': 'cache-stale'
        }
      });
    }

    if (err instanceof Error) {
      const customErr: CustomError = { message: err.message };
      return NextResponse.json(
        { error: customErr.message }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}