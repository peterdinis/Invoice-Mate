import { NextRequest, NextResponse } from "next/server";
import User from "../../../../models/User";
import bcrypt from "bcryptjs";
import { createToken } from "../../../../lib/auth";
import connectToDB from "@/lib/mongoose";

export async function POST(req: NextRequest) {
  await connectToDB();
  const { email, password } = await req.json();

  const existingUser = await User.findOne({ email });
  if (existingUser) return NextResponse.json({ error: "User exists" }, { status: 400 });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashedPassword });

  const token = createToken(user._id.toString());

  return NextResponse.json({ token, email: user.email }, { status: 201 });
}