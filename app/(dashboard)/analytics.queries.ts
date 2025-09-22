import { createClient } from "@supabase/supabase-js";


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


export async function fetchPriceBins(genreId: string) {
  return supabase.from("v_price_bins").select("bin,cnt").eq("genre_id", genreId);
}


export async function fetchReviewStats(genreId: string) {
  return supabase.from("v_review_stats").select("avg_rating,med_rating,avg_review_count").eq("genre_id", genreId).single();
}


export async function fetchTopShops(genreId: string, limit = 10) {
  const { data, error } = await supabase
    .from("v_top_shops")
    .select("shop_name,items,avg_price")
    .eq("genre_id", genreId)
    .order("items", { ascending: false })
    .limit(limit);
  return { data, error };
}


export async function fetchLatestItems(genreId: string, limit = 200) {
  const { data, error } = await supabase
    .from("latest_rankings")
    .select("item_name")
    .eq("genre_id", genreId)
    .limit(limit);
  return { data, error };
}