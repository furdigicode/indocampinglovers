import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { parseCampgroundUpdateSubmission } from "@/lib/submissions/campground-update";

export const runtime="nodejs";
const code=()=>`ICL-U-${randomBytes(4).toString("hex").toUpperCase()}`;

export async function POST(request:NextRequest){
  const length=Number(request.headers.get("content-length")??"0");
  if(length>16_000)return NextResponse.json({error:"Payload terlalu besar."},{status:413});
  let input;
  try{input=parseCampgroundUpdateSubmission(await request.json())}
  catch{return NextResponse.json({error:"Data usulan perubahan belum valid."},{status:400})}
  const supabase=createServerSupabaseClient();
  const {data:camp,error:campError}=await supabase.from("campgrounds").select("id,status").eq("id",input.campgroundId).eq("status","published").maybeSingle();
  if(campError)return NextResponse.json({error:"Usulan belum dapat diproses."},{status:500});
  if(!camp)return NextResponse.json({error:"Campground tidak tersedia untuk usulan perubahan."},{status:404});

  const {data:existing}=await supabase.from("campground_update_submissions").select("reference_code").eq("idempotency_key",input.idempotencyKey).maybeSingle();
  if(existing?.reference_code)return NextResponse.json({ok:true,referenceCode:existing.reference_code,duplicate:true});

  const payload={version:1,proposedChange:input.proposedChange,consent:true};
  for(let attempt=0;attempt<3;attempt++){
    const referenceCode=code();
    const {error}=await supabase.from("campground_update_submissions").insert({
      campground_id:input.campgroundId,submitter_name:input.submitterName,submitter_contact:input.submitterContact,
      update_type:input.updateType,payload,status:"pending",reference_code:referenceCode,idempotency_key:input.idempotencyKey,
    });
    if(!error)return NextResponse.json({ok:true,referenceCode},{status:201});
    if(error.code==="23505"){
      const {data:duplicate}=await supabase.from("campground_update_submissions").select("reference_code").eq("idempotency_key",input.idempotencyKey).maybeSingle();
      if(duplicate?.reference_code)return NextResponse.json({ok:true,referenceCode:duplicate.reference_code,duplicate:true});
      continue;
    }
    return NextResponse.json({error:"Usulan perubahan belum dapat disimpan."},{status:500});
  }
  return NextResponse.json({error:"Usulan perubahan belum dapat disimpan."},{status:500});
}
