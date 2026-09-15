import { NextResponse } from "next/server";
import { createPublicSupabaseClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createPublicSupabaseClient();
    const { count, error } = await supabase
      .from("provinces")
      .select("id", { count: "exact", head: true });

    if (error) {
      console.error("Supabase health check failed", error.message);
      return NextResponse.json(
        { ok: false, service: "supabase", error: "database_unavailable" },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      service: "supabase",
      checks: {
        publicDataApi: "reachable",
        provinces: count ?? 0
      }
    });
  } catch (error) {
    console.error("Supabase health check configuration failed", error);
    return NextResponse.json(
      { ok: false, service: "supabase", error: "configuration_error" },
      { status: 503 }
    );
  }
}
