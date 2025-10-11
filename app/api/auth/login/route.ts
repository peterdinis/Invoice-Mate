import { NextRequest, NextResponse } from "next/server";
import User from "../../../../models/User";
import bcrypt from "bcryptjs";
import { createToken } from "../../../../lib/auth";
import connectToDB from "@/lib/mongoose";

export async function POST(req: NextRequest) {
  await connectToDB();
  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });

  const token = createToken(user._id.toString());
  return NextResponse.json({ token, email: user.email });
}
