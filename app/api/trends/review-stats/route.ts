import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const genreId = searchParams.get("genreId")!;
  const { data, error } = await supabase
    .from("v_review_stats")
    .select("avg_rating,med_rating,avg_review_count")
    .eq("genre_id", genreId)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ ok: true, data: null });
  }
  return NextResponse.json({ ok: true, data });
}
