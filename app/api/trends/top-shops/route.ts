import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const genreId = searchParams.get("genreId")!;
  const limit = Number(searchParams.get("limit") ?? 10);
  const { data, error } = await supabase
    .from("v_top_shops")
    .select("shop_name,items,avg_price,min_price,max_price")
    .eq("genre_id", genreId)
    .order("items", { ascending: false })
    .limit(limit);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}
