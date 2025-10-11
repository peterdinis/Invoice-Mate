import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) throw new Error("Please define JWT_SECRET");

export const createToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return null;
  }
};