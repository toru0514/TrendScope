// Server Route: posts と post_insights を安全にUPSERT → ロールアップ更新
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key  = process.env.SUPABASE_SERVICE_ROLE_KEY!; // ← サーバだけ
const admin = createClient(url, key, { auth: { persistSession: false }});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // body 例:
    // { post_id:"t_demo_api", posted_at:"2025-09-18T11:00:00Z",
    //   url:"https://x.com/.../status/t_demo_api",
    //   intent:"request", summary:"チタンで軽いピアス欲しい",
    //   pain_points:[], desired_features:["金アレ対策","軽量"], materials:["チタン"], motifs:[] }

    // 1) posts
    await admin.from("posts").upsert({
      post_id: body.post_id,
      platform: "x",
      author_id: body.author_id ?? null,
      posted_at: body.posted_at ?? null,
      url: body.url ?? null,
    }).throwOnError();

    // 2) insights
    await admin.from("post_insights").upsert({
      post_id: body.post_id,
      intent: body.intent,
      pain_points: body.pain_points ?? [],
      desired_features: body.desired_features ?? [],
      materials: body.materials ?? [],
      motifs: body.motifs ?? [],
      summary: body.summary ?? null,
    }).throwOnError();

    // 3) ロールアップ反映
    await admin.rpc("update_rollups_hourly");

    return NextResponse.json({ ok: true });
  } catch (e:any) {
    console.error(e);
    return NextResponse.json({ ok:false, error:String(e?.message||e) }, { status: 500 });
  }
}
