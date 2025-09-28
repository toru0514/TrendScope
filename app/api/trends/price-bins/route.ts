import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const genreId = searchParams.get("genreId")!;
  const { data, error } = await supabase.from("v_price_bins").select("bin,cnt").eq("genre_id", genreId);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });


  // ビン→ラベルへ整形（例：0〜5千, 5千〜1万 ...）
  const max = 50000;
  const buckets = 10;
  const step = max / buckets;

  const formatSegment = (value: number) => {
    if (value <= 0) return "0";
    if (value >= 10000) {
      const unit = value / 10000;
      const str = Number.isInteger(unit)
        ? `${unit}`
        : `${unit.toFixed(1)}`.replace(/\.0$/, "");
      return `${str}万`;
    }
    const unit = value / 1000;
    const str = Number.isInteger(unit)
      ? `${unit}`
      : `${unit.toFixed(1)}`.replace(/\.0$/, "");
    return `${str}千`;
  };

  const series = (data ?? []).map((r: any) => {
    const bin = Number(r.bin);
    const labelStart = formatSegment(step * (bin - 1));
    const labelEnd = formatSegment(step * bin);
    return {
      label: `${labelStart}〜${labelEnd}`,
      value: Number(r.cnt),
    };
  });
  return NextResponse.json({ ok: true, data: series });
}
