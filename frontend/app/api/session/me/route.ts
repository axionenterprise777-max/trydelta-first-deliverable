import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getUserByToken } from "../../../../lib/mock-store";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("trydelta_session")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  const user = getUserByToken(token);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      tenant_id: user.tenant_id,
      name: user.name,
      email: user.email,
      role: user.role,
      initials: user.initials,
    },
  });
}
