import { NextResponse } from "next/server";

import { createContactRequest } from "../../../lib/mock-store";

export async function POST(request: Request) {
  const payload = await request.json();
  const data = createContactRequest(payload);
  return NextResponse.json(data, { status: 201 });
}
