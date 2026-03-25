import { NextResponse } from "next/server";
import { getAuth } from "@/lib/get-auth";
import { retryDlq } from "@/lib/db";

type RouteContext = { params: Promise<{ jobId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Sessao ausente." }, { status: 401 });

  const { jobId } = await context.params;
  const retried = retryDlq(auth.tenantId, jobId);
  if (!retried) {
    return NextResponse.json({ message: "Job nao encontrado." }, { status: 404 });
  }
  return NextResponse.json(retried);
}
