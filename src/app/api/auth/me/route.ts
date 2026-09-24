import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("glimglee_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  const user = verifyToken(token);
  return NextResponse.json({ user });
}
