import { NextRequest, NextResponse } from "next/server";

const RAKUTEN_APP_ID = process.env.RAKUTEN_APP_ID;

function mapEntry(entry: any) {
  if (!entry) return null;
  const node = entry.child || entry.parent || entry;
  if (!node) return null;
  const id = node.genreId ?? node.id;
  const name = node.genreName ?? node.name;
  const level = node.genreLevel ?? node.level;
  if (id == null || name == null) return null;
  return {
    id: String(id),
    name: String(name),
    level: typeof level === "number" ? level : undefined,
  };
}

export async function GET(req: NextRequest) {
  if (!RAKUTEN_APP_ID) {
    return NextResponse.json(
      {
        ok: false,
        error: "RAKUTEN_APP_IDを設定してください",
      },
      { status: 500 }
    );
  }
  try {
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get("parentId");
    const genreId = searchParams.get("genreId") ?? parentId ?? "0";

    const endpoint = new URL(
      "https://app.rakuten.co.jp/services/api/IchibaGenre/Search/20140222"
    );
    endpoint.searchParams.set("applicationId", RAKUTEN_APP_ID);
    endpoint.searchParams.set("genreId", genreId);
    endpoint.searchParams.set("format", "json");

    const res = await fetch(endpoint.toString(), {
      cache: "no-store",
    });

    if (!res.ok) {
      let detail = "";
      try {
        const text = await res.text();
        if (text) {
          detail = text;
        }
      } catch {
        // ignore
      }
      return NextResponse.json(
        {
          ok: false,
          error: `Rakuten ${res.status}${detail ? `: ${detail}` : ""}`,
        },
        { status: 500 }
      );
    }

    const json = await res.json();

    const children = Array.isArray(json?.children)
      ? json.children.map(mapEntry).filter(Boolean)
      : [];
    const parents = Array.isArray(json?.parents)
      ? json.parents.map(mapEntry).filter(Boolean)
      : [];
    const current = mapEntry(json?.current);

    return NextResponse.json({
      ok: true,
      data: {
        current,
        parents,
        children,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message ?? String(error),
      },
      { status: 500 }
    );
  }
}
