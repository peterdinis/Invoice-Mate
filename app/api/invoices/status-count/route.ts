import { NextResponse } from "next/server";
import Invoice, { InvoiceStatus } from "@/models/Invoice";
import connectToDB from "@/lib/auth/mongoose";

const STATUS_CONFIG = {
  [InvoiceStatus.PAID]: { name: "Zaplatené", color: "#22c55e" },
  [InvoiceStatus.PENDING]: { name: "Čakajúce", color: "#eab308" },
  [InvoiceStatus.OVERDUE]: { name: "Po splatnosti", color: "#ef4444" },
} as const;

let dbConnected = false;
const CACHE_DURATION = 2 * 60 * 1000; 
let cache: { data: any; timestamp: number } | null = null;

async function ensureConnection() {
  if (!dbConnected) {
    await connectToDB();
    dbConnected = true;
  }
}

export async function GET(request: Request) {
  try {
    const cacheHeader = request.headers.get('Cache-Control');
    const skipCache = cacheHeader === 'no-cache';
    
    if (!skipCache && cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      return NextResponse.json(cache.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=120',
          'X-Data-Source': 'cache'
        }
      });
    }

    await ensureConnection();

    const statusCounts = await Invoice.aggregate([
      {
        $match: {
          status: { 
            $in: [InvoiceStatus.PAID, InvoiceStatus.PENDING, InvoiceStatus.OVERDUE] 
          }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const countsMap = new Map(
      statusCounts.map(item => [item._id, item.count])
    );

    const paidCount = countsMap.get(InvoiceStatus.PAID) || 0;
    const pendingCount = countsMap.get(InvoiceStatus.PENDING) || 0;
    const overdueCount = countsMap.get(InvoiceStatus.OVERDUE) || 0;
    const total = paidCount + pendingCount + pendingCount;

    const data = Object.entries(STATUS_CONFIG).map(([status, config]) => {
      const value = countsMap.get(status as InvoiceStatus) || 0;
      const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
      
      return {
        name: config.name,
        value,
        percentage,
        color: config.color,
        status: status
      };
    });

    const responseData = { 
      data, 
      total,
      updatedAt: new Date().toISOString()
    };

    // Update cache
    cache = {
      data: responseData,
      timestamp: Date.now()
    };

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=60',
        'X-Data-Source': 'database'
      }
    });

  } catch (error) {
    console.error("Error fetching invoice status counts:", error);
    dbConnected = false;

    // Return cached data as fallback (even if stale)
    if (cache) {
      console.log("Returning stale cached data due to error");
      return NextResponse.json(cache.data, {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache',
          'X-Data-Source': 'cache-stale'
        }
      });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}