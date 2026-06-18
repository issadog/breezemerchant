import { NextResponse } from "next/server";
import { GenerateInputSchema } from "@/lib/schema";
import { generateFrame } from "@/lib/generate";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad-input" }, { status: 400 }); }
  const parsed = GenerateInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "bad-input" }, { status: 400 });
  const frame = await generateFrame(parsed.data);
  return NextResponse.json({ frame });
}
