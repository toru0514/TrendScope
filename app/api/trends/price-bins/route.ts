import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const genreId = searchParams.get("genreId")!;
  const { data, error } = await supabase.from("v_price_bins").select("bin,cnt").eq("genre_id", genreId);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });


// ビン→ラベルへ整形（例：0-5k, 5k-10k ...）
  const max = 50000; const buckets = 10; const step = max / buckets;
  const series = (data ?? []).map((r: any) => ({
    label: `${Math.round((r.bin-1)*step/1000)}k–${Math.round(r.bin*step/1000)}k`,
    value: r.cnt as number,
  }));
  return NextResponse.json({ ok: true, data: series });
}