// app/api/fetch-rakuten/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// ---- Env checks (fail fast) ----
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RAKUTEN_APP_ID = process.env.RAKUTEN_APP_ID; // server-only

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RAKUTEN_APP_ID) {
  console.error("[fetch-rakuten] Missing env", {
    hasUrl: !!SUPABASE_URL,
    hasServiceRole: !!SUPABASE_SERVICE_ROLE_KEY,
    hasAppId: !!RAKUTEN_APP_ID,
  });
}

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

// ---- helpers ----
function normalizeImages(
  small: any[] | undefined,
  medium: any[] | undefined
): string[] | null {
  const s = Array.isArray(small) ? small.map((u) => u?.imageUrl).filter(Boolean) : [];
  const m = Array.isArray(medium) ? medium.map((u) => u?.imageUrl).filter(Boolean) : [];
  const merged = Array.from(new Set<string>([...s, ...m]));
  return merged.length ? merged : null;
}

// numeric列に安全に入れるため、JS側は string で保持
function toStrNumeric(v: unknown): string | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v as any);
  return Number.isFinite(n) ? String(n) : null;
}

// shop_name が無いとき、URLのホストから推定
function extractShopFromUrl(u?: string | null): string | null {
  if (!u) return null;
  try {
    const host = new URL(u).host; // 例: shop.rakuten.co.jp
    const m = host.match(/^([^.]+)\.rakuten\.co\.jp$/);
    return m ? m[1] : host;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RAKUTEN_APP_ID) {
      return NextResponse.json(
        {
          ok: false,
          error: "サーバー環境変数 (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / RAKUTEN_APP_ID) を設定してください",
        },
        { status: 500 }
      );
    }

    // --- input ---
    const { searchParams } = new URL(req.url);
    const genreId = searchParams.get("genreId") ?? "100486";

    // --- call Rakuten Ranking API ---
    const endpoint = new URL(
      "https://app.rakuten.co.jp/services/api/IchibaItem/Ranking/20220601"
    );
    endpoint.searchParams.set("applicationId", RAKUTEN_APP_ID!);
    endpoint.searchParams.set("genreId", genreId);
    endpoint.searchParams.set("format", "json");

    const res = await fetch(endpoint.toString(), { cache: "no-store" });
    if (!res.ok) {
      let detail = "";
      try {
        const text = await res.text();
        if (text) {
          try {
            const json = JSON.parse(text);
            detail = json?.error_description || json?.error || text;
          } catch {
            detail = text;
          }
        }
      } catch {
        // ignore body parse errors
      }
      return NextResponse.json(
        {
          ok: false,
          error: `Rakuten ${res.status}${detail ? `: ${detail}` : ""}`,
        },
        { status: 500 }
      );
    }

    // --- parse JSON safely ---
    let data: any;
    try {
      data = await res.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Rakuten JSON parse error" },
        { status: 500 }
      );
    }

    const items: any[] = Array.isArray(data?.Items) ? data.Items : [];
    const capturedAt = new Date().toISOString();
    const rows = items
      .map((wrap: any) => {
        const it = wrap?.Item ?? wrap ?? {};
        const rank = Number(it.rank ?? 0);
        const url = it.itemUrl ?? null;

        const itemName = it.itemName ?? it.title ?? null; // フォールバック
        const shopName = it.shopName ?? extractShopFromUrl(url); // URLから推定

        return {
          platform: "rakuten",
          genre_id: String(genreId),
          rank,
          item_id: String(it.itemCode ?? url ?? ""),
          captured_at: capturedAt,

          item_name: itemName,
          title: itemName, // 互換のため title も保存
          price: toStrNumeric(it.itemPrice),
          url,

          review_count: it.reviewCount != null ? Number(it.reviewCount) : null,
          review_average: toStrNumeric(it.reviewAverage),
          point_rate: it.pointRate != null ? Number(it.pointRate) : null,

          shop_name: shopName,
          shop_url: it.shopUrl ?? null,
          image_urls: normalizeImages(it.smallImageUrls, it.mediumImageUrls),

          source_params: { mode: "genre", genreId },
          // NOTE: captured_at は送らない（DBの default now() に任せる）
        };
      })
      .filter((r: any) => r.rank > 0 && r.item_id);

    if (!rows.length) {
      return NextResponse.json({ ok: true, inserted: 0, note: "no rows" });
    }

    // 同分内の重複防止（captured_minute のユニーク前提）
    const { error, count } = await supabase!
      .from("market_rankings")
      .upsert(rows, {
        onConflict: "platform,genre_id,rank,captured_minute",
        ignoreDuplicates: true,
        count: "exact",
      });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, inserted: count ?? rows.length });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
