import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST only — a GET handler would get hit by Next.js Link prefetch,
// silently signing the user out as soon as the header rendered.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // 303 forces the browser to follow with GET.
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
