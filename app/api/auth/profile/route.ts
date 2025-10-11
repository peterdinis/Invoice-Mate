import { NextRequest, NextResponse } from "next/server";
import User from "../../../../models/User";
import { verifyToken } from "../../../../lib/auth";
import connectToDB from "@/lib/mongoose";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDB();
  const user = await User.findById((payload as any).userId).select("-password");
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(user);
}