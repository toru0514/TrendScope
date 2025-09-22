// app/api/trends/keywords/route.ts （置き換え）
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// よく出る汎用ワードは除外
const STOP = new Set([
  "送料無料","公式","純正","日本製","セット","新作","人気","おすすめ","ランキング",
  "ポイント","倍","限定","福袋","SALE","セール"
]);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const genreId = searchParams.get("genreId")!;
  const limit = Number(searchParams.get("limit") ?? 30);

  const { data, error } = await supabase
    .from("latest_rankings")
    .select("item_name")
    .eq("genre_id", genreId)
    .limit(300);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const freq = new Map<string, number>();
  const tokenRe = /[一-龠々]+|[ぁ-んァ-ンー]+|[A-Za-z0-9]+/g; // 漢字/かな/英数の連続

  for (const r of data ?? []) {
    const t = (r as any).item_name as string | null;
    if (!t) continue;
    const tokens = t.match(tokenRe) ?? [];
    for (const w of tokens) {
      if (w.length < 2) continue;
      if (STOP.has(w)) continue;
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }

  const sorted = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([token, count]) => ({ token, count }));

  return NextResponse.json({ ok: true, data: sorted });
}
