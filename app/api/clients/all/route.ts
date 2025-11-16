import { NextResponse } from "next/server";
import Client from "@/models/Client";
import connectToDB from "@/lib/auth/mongoose";

let dbPromise: Promise<void> | null = null;
let dbConnected = false;

// Cache with TTL for frequently accessed data
const cache = {
  data: null as any,
  timestamp: 0,
  ttl: 30000, // 30 seconds
};

export async function GET(request: Request) {
  try {
    // Connection management with single promise
    if (!dbConnected && !dbPromise) {
      dbPromise = connectToDB().then(() => {
        dbConnected = true;
        dbPromise = null;
      });
    }
    if (dbPromise) await dbPromise;

    // Check cache for repeated requests
    const now = Date.now();
    if (cache.data && (now - cache.timestamp) < cache.ttl) {
      return NextResponse.json(cache.data);
    }

    // Optimized query with read preferences and timeout
    const clients = await Client.find(
      {}, 
      { name: 1, email: 1, address: 1, _id: 1 }
    )
      .lean()
      .maxTimeMS(3000)
      .read('primaryPreferred'); // Prefer primary but can read from secondaries

    // Update cache
    cache.data = clients;
    cache.timestamp = now;

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    
    // Reset connection state
    dbConnected = false;
    dbPromise = null;
    
    // Return cached data as fallback if available (even if stale)
    if (cache.data) {
      console.log("Returning cached data due to error");
      return NextResponse.json(cache.data);
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}