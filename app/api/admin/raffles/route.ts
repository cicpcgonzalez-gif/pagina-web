import { NextResponse } from "next/server";

// Node runtime required (no Edge) because we may expand server-only logic later
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Placeholder route: backend real logic lives in src/app/api/admin/raffles
// This avoids Prisma initialization during Next.js build in the legacy app/ folder.
export async function POST() {
  return NextResponse.json({ message: "Admin raffles route disabled in this build." }, { status: 200 });
}
