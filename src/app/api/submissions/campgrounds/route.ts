import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { parseNewCampgroundSubmission } from "@/lib/submissions/new-campground";

export const runtime = "nodejs";

function referenceCode() {
  return `ICL-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 32_000) return NextResponse.json({ error: "Payload terlalu besar." }, { status: 413 });

  let input;
  try { input = parseNewCampgroundSubmission(await request.json()); }
  catch { return NextResponse.json({ error: "Data submission belum valid." }, { status: 400 }); }

  const supabase = createServerSupabaseClient();

  const { data: geography, error: geographyError } = await supabase
    .from("regencies").select("id,province_id").eq("id", input.regencyId).eq("province_id", input.provinceId).maybeSingle();
  if (geographyError) return NextResponse.json({ error: "Submission belum dapat diproses." }, { status: 500 });
  if (!geography) return NextResponse.json({ error: "Kabupaten/kota tidak sesuai dengan provinsi." }, { status: 400 });

  const { data: existing } = await supabase
    .from("campground_submissions").select("reference_code").eq("idempotency_key", input.idempotencyKey).maybeSingle();
  if (existing?.reference_code) return NextResponse.json({ ok: true, referenceCode: existing.reference_code, duplicate: true });

  const payload = {
    version: 1,
    campground: {
      name: input.name, provinceId: input.provinceId, regencyId: input.regencyId, address: input.address,
      latitude: input.latitude, longitude: input.longitude, typeIds: input.typeIds, facilityIds: input.facilityIds,
      access: input.access, price: input.price, contacts: input.contacts, notes: input.notes,
    },
    consent: input.consent,
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    const code = referenceCode();
    const { error } = await supabase.from("campground_submissions").insert({
      submitter_name: input.submitterName,
      submitter_contact: input.submitterContact,
      payload,
      status: "pending",
      reference_code: code,
      idempotency_key: input.idempotencyKey,
    });
    if (!error) return NextResponse.json({ ok: true, referenceCode: code }, { status: 201 });
    if (error.code === "23505") {
      const { data: duplicate } = await supabase.from("campground_submissions").select("reference_code").eq("idempotency_key", input.idempotencyKey).maybeSingle();
      if (duplicate?.reference_code) return NextResponse.json({ ok: true, referenceCode: duplicate.reference_code, duplicate: true });
      continue;
    }
    return NextResponse.json({ error: "Submission belum dapat disimpan." }, { status: 500 });
  }
  return NextResponse.json({ error: "Submission belum dapat disimpan." }, { status: 500 });
}
