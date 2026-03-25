import { NextResponse } from "next/server";

import { clearToken } from "../../../../lib/mock-store";

export async function POST() {
  // Route handler cannot read old cookies after delete, so clear by best effort via token header when present.
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("trydelta_session");
  response.cookies.delete("trydelta_tenant");
  response.cookies.delete("trydelta_user");
  clearToken(undefined);
  return response;
}
