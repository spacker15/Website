import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Match all routes except static assets and Next internals
    "/((?!_next/static|_next/image|favicon.ico|logos/|icon.png|opengraph-image|sitemap.xml|robots.txt).*)",
  ],
};
