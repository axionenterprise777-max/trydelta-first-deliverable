import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("trydelta_session");
  response.cookies.delete("trydelta_tenant");
  response.cookies.delete("trydelta_user");
  return response;
}
