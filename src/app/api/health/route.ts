import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    { status: "ok", service: "Mindora API", timestamp: new Date().toISOString() },
    { status: 200 }
  );
}
