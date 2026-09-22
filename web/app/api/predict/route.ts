import { NextRequest, NextResponse } from "next/server";

// Server-only — never exposed to the browser (not NEXT_PUBLIC_*). This is
// the whole point of proxying through a Next.js route: the FastAPI URL and
// any future auth never reach client JS, and there is no cross-origin
// request in production because the browser only ever talks to this route.
const API_URL = process.env.API_URL ?? "http://localhost:8000";

// The free-tier backend can take 30-60s to wake from sleep. Vercel Hobby
// allows up to 300s; 60s comfortably covers a worst-case cold start
// without letting a genuinely hung request pin a function open.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.text();

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  } catch {
    return NextResponse.json(
      { detail: "The churn API is unreachable." },
      { status: 502 },
    );
  }

  const data = await upstream.text();
  return new NextResponse(data, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}
