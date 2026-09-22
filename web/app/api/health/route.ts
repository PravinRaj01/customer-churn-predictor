import { NextResponse } from "next/server";

// Mirrors app/api/predict/route.ts's proxy pattern. Used by
// hooks/useWarmBackend.ts to ping the backend awake on page load, so a
// sleeping Render instance is already waking by the time the user
// finishes filling in the form and presses "Churn It".
const API_URL = process.env.API_URL ?? "http://localhost:8000";

export const maxDuration = 60;

export async function GET() {
  try {
    const upstream = await fetch(`${API_URL}/api/health`, {
      // Never cache a health check — it exists purely to wake the
      // backend, and a cached "ok" would defeat that on every load after
      // the first.
      cache: "no-store",
    });
    const data = await upstream.text();
    return new NextResponse(data, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json(
      { detail: "The churn API is unreachable." },
      { status: 502 },
    );
  }
}
