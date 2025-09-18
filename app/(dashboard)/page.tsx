import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TrendFilter from "@/app/_components/filters/TrendFilter";
import TopList from "@/app/_components/charts/TopList";
import PostSamples from "@/app/_components/table/PostSamples";
import TrendLineSection from "@/app/_components/charts/TrendLineSection";
import { supabaseBrowser } from "@/lib/supabase";

function sinceISO(kind: string) {
  const d = new Date();
  const map: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
  d.setDate(d.getDate() - (map[kind] ?? 30));
  return d.toISOString();
}

export default async function DashboardPage({ searchParams }: { searchParams?: Record<string, string> }) {
  const sp = await searchParams;

  const since = sp?.since ?? "30d";
  const intent = sp?.intent ?? "request";

  const supabase = supabaseBrowser();

  const { data: lineRaw } = await supabase
    .from("rollups_hourly")
    .select("bucket,count")
    .gte("bucket", sinceISO(since))
    .eq("intent", intent)
    .order("bucket", { ascending: true });

  const { data: painTopRaw } = await supabase
    .from("rollups_hourly")
    .select("facet_key,count")
    .gte("bucket", sinceISO(since))
    .eq("intent", "complaint")
    .order("count", { ascending: false }).limit(10);

  const { data: desireTopRaw } = await supabase
    .from("rollups_hourly")
    .select("facet_key,count")
    .gte("bucket", sinceISO(since))
    .eq("intent", "request")
    .order("count", { ascending: false }).limit(10);

  const { data: samples } = await supabase
    .from("post_insights")
    .select("post_id,summary,intent")
    .eq("intent", intent)
    .limit(20);

  const lineSeries = (lineRaw ?? []).map((r: any) => ({ bucket: r.bucket, count: r.count }));
  const painTop    = (painTopRaw   ?? []).map((r: any) => ({ key: r.facet_key, count: r.count }));
  const desireTop  = (desireTopRaw ?? []).map((r: any) => ({ key: r.facet_key, count: r.count }));

  return (
    <div className="grid gap-6 md:grid-cols-12">
      <Card className="md:col-span-3">
        <CardHeader><CardTitle>フィルタ</CardTitle></CardHeader>
        <CardContent><TrendFilter defaultSince={since} defaultIntent={intent}/></CardContent>
      </Card>

      {/* Chart.js 部分はクライアント側へ委譲 */}
      <TrendLineSection series={lineSeries} />

      <Card className="md:col-span-6">
        <CardHeader><CardTitle>痛みポイント Top10</CardTitle></CardHeader>
        <CardContent><TopList items={painTop}/></CardContent>
      </Card>

      <Card className="md:col-span-6">
        <CardHeader><CardTitle>要望 Top10</CardTitle></CardHeader>
        <CardContent><TopList items={desireTop}/></CardContent>
      </Card>

      <Card className="md:col-span-12">
        <CardHeader><CardTitle>投稿サンプル</CardTitle></CardHeader>
        <CardContent><PostSamples rows={samples ?? []}/></CardContent>
      </Card>
    </div>
  );
}
