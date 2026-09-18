import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const MAX_PHOTOS = 5;
const MIME_EXT: Record<string,string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function validReference(value:string) {
  return /^ICL-[A-F0-9]{8}$/.test(value);
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_FILE_SIZE + 64_000)
    return NextResponse.json({ error: "Ukuran foto melebihi batas 8 MB." }, { status: 413 });

  let form: FormData;
  try { form = await request.formData(); }
  catch { return NextResponse.json({ error: "Upload foto tidak valid." }, { status: 400 }); }

  const referenceCode = String(form.get("referenceCode") ?? "").trim().toUpperCase();
  const file = form.get("file");
  if (!validReference(referenceCode) || !(file instanceof File))
    return NextResponse.json({ error: "Upload foto tidak valid." }, { status: 400 });
  if (!MIME_EXT[file.type] || file.size <= 0 || file.size > MAX_FILE_SIZE)
    return NextResponse.json({ error: "Gunakan JPEG, PNG, atau WebP maksimal 8 MB." }, { status: 400 });

  const supabase = createServerSupabaseClient();
  const { data: submission, error: submissionError } = await supabase
    .from("campground_submissions").select("id,status").eq("reference_code", referenceCode).maybeSingle();
  if (submissionError) return NextResponse.json({ error: "Foto belum dapat diproses." }, { status: 500 });
  if (!submission || submission.status !== "pending")
    return NextResponse.json({ error: "Submission tidak tersedia untuk upload foto." }, { status: 404 });

  const { count, error: countError } = await supabase
    .from("campground_submission_photos").select("id",{count:"exact",head:true}).eq("submission_id",submission.id);
  if (countError) return NextResponse.json({ error: "Foto belum dapat diproses." }, { status: 500 });
  if ((count ?? 0) >= MAX_PHOTOS)
    return NextResponse.json({ error: "Maksimal 5 foto per submission." }, { status: 400 });

  const path = `${submission.id}/${randomUUID()}.${MIME_EXT[file.type]}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage.from("campground-submissions").upload(path,bytes,{
    contentType:file.type,upsert:false,cacheControl:"3600",
  });
  if (uploadError) return NextResponse.json({ error: "Foto gagal diunggah." }, { status: 500 });

  const { error: metadataError } = await supabase.from("campground_submission_photos").insert({
    submission_id: submission.id,
    storage_path: path,
    original_name: file.name.slice(0,255),
    mime_type: file.type,
    file_size: file.size,
    status: "pending",
    sort_order: count ?? 0,
  });
  if (metadataError) {
    await supabase.storage.from("campground-submissions").remove([path]);
    return NextResponse.json({ error: "Foto gagal dicatat." }, { status: 500 });
  }
  return NextResponse.json({ ok:true, photo:{ name:file.name, size:file.size, position:(count??0)+1 } }, { status:201 });
}
