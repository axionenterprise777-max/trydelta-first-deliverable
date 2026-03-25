import { NextResponse } from "next/server";
import { createContactRequest } from "@/lib/db";

export async function POST(request: Request) {
  let companyName = "";
  let contactName = "";
  let email = "";
  let planId = "pro";
  let teamSize = 0;
  let notes: string | undefined;

  try {
    const body = (await request.json()) as {
      company_name?: string;
      contact_name?: string;
      email?: string;
      plan_id?: string;
      team_size?: number;
      notes?: string;
    };
    companyName = body.company_name?.trim() ?? "";
    contactName = body.contact_name?.trim() ?? "";
    email = body.email?.trim() ?? "";
    planId = body.plan_id ?? "pro";
    teamSize = body.team_size ?? 0;
    notes = body.notes;
  } catch {
    return NextResponse.json({ message: "Body JSON invalido." }, { status: 400 });
  }

  if (!companyName || !contactName || !email) {
    return NextResponse.json({ message: "company_name, contact_name e email obrigatorios." }, { status: 400 });
  }

  const data = createContactRequest({
    company_name: companyName,
    contact_name: contactName,
    email,
    plan_id: planId,
    team_size: teamSize,
    notes,
  });
  return NextResponse.json(data, { status: 201 });
}
