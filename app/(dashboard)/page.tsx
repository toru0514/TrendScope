// app/(dashboard)/page.tsx
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import GenreFilter from "@/app/_components/filters/GenreFilter";
import BarChart, { BarDatum } from "@/app/_components/charts/BarChart";
import PriceHistogram from "@/app/_components/trends/PriceHistogram";
import ReviewStatsCard from "@/app/_components/trends/ReviewStatsCard";
import TopShopsTable from "@/app/_components/trends/TopShopsTable";
import KeywordList from "@/app/_components/trends/KeywordList";
import FetchRakutenButton from "@/app/_components/FetchRakutenButton";

function truncate(s: string, n = 24) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function DashboardPage({
                                              searchParams,
                                            }: {
  // ✅ Promise で受け取り
  searchParams: Promise<{ genre?: string }>;
}) {
  // ✅ まず await
  const sp = await searchParams;
  const genreId = sp?.genre ?? "216129";

  // ----- 以下はそのまま -----
  const { data: latest, error: latestErr } = await supabase
    .from("market_rankings")
    .select("captured_at")
    .eq("genre_id", genreId)
    .order("captured_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let rankings:
    | Array<{ rank: number; title: string | null; price: string | null; url: string | null; captured_at: string }>
    | [] = [];
  let listErr: any = null;

  if (latest?.captured_at) {
    const { data, error } = await supabase
      .from("market_rankings")
      .select("rank, title, price, url, captured_at")
      .eq("genre_id", genreId)
      .eq("captured_at", latest.captured_at)
      .order("rank", { ascending: true })
      .limit(30);
    rankings = data ?? [];
    listErr = error;
  }

  const priceTop10: BarDatum[] = (rankings ?? [])
    .filter((r) => r.price != null)
    .slice(0, 10)
    .map((r) => ({ label: truncate(r.title ?? ""), value: Number(r.price) }));

  const capturedLabel = latest?.captured_at ? new Date(latest.captured_at).toLocaleString() : "—";

  return (
    <div className="grid gap-6 md:grid-cols-12">
      <div className="md:col-span-12 flex items-center justify-between">
        <h1 className="text-xl font-semibold">楽天トレンドダッシュボード</h1>
        <FetchRakutenButton genreId={genreId} />
      </div>

      <div className="md:col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><PriceHistogram genreId={genreId} /></div>
        <ReviewStatsCard genreId={genreId} />
      </div>

      <div className="md:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopShopsTable genreId={genreId} />
        <KeywordList genreId={genreId} />
      </div>

      <Card className="md:col-span-12">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>楽天ランキング（ジャンル切替）</CardTitle>
        </CardHeader>
        <CardContent>
          <GenreFilter />
          <p className="text-xs text-muted-foreground mt-2">データ提供: 楽天ウェブサービス</p>
          {(latestErr || listErr) && (
            <p className="mt-2 text-xs text-red-600">取得エラー: {latestErr?.message || listErr?.message}</p>
          )}
          {!rankings?.length && (
            <p className="mt-2 text-sm text-muted-foreground">
              データがまだありません。まず
              <code className="mx-1 rounded bg-muted px-1 py-0.5">/api/fetch-rakuten</code>
              を実行してスナップショットを作成してください。
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-6">
        <CardHeader><CardTitle>価格 Top10（最新スナップショット）</CardTitle></CardHeader>
        <CardContent><BarChart data={priceTop10} title="価格(円)" /></CardContent>
      </Card>

      <Card className="md:col-span-6">
        <CardHeader><CardTitle>ランキング Top30（{capturedLabel}）</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
              <tr className="text-left border-b">
                <th className="p-2">順位</th>
                <th className="p-2">商品名</th>
                <th className="p-2">価格</th>
              </tr>
              </thead>
              <tbody>
              {(rankings ?? []).map((item) => (
                <tr key={`${item.rank}-${item.title}`} className="border-b hover:bg-neutral-50">
                  <td className="p-2">{item.rank}</td>
                  <td className="p-2">
                    <a href={item.url ?? "#"} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {item.title}
                    </a>
                  </td>
                  <td className="p-2">{item.price != null ? `${Number(item.price).toLocaleString()} 円` : "—"}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
