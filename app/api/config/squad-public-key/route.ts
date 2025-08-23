import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ publicKey: process.env.SQUAD_SECRET_KEY ?? null });
}
