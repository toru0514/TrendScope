"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";


export default function FetchRakutenButton({ genreId }: { genreId: string }) {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<null | boolean>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();


  async function handleClick() {
    try {
      setLoading(true);
      setOk(null);
      setError(null);
      const res = await fetch(`/api/fetch-rakuten?genreId=${encodeURIComponent(genreId)}`, {
        method: "POST",
      });
      const json = await res.json();
      setOk(!!json?.ok);
      if (!json?.ok) {
        setError(json?.error ?? "不明なエラーが発生しました");
      }
      if (json?.ok) {
        window.dispatchEvent(
          new CustomEvent("rakuten-data-updated", {
            detail: { genreId, at: Date.now() },
          })
        );
      }
    } catch (e) {
      setOk(false);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
// データ取得後に最新状態へ
      startTransition(() => router.refresh());
    }
  }


  return (
    <div className="flex items-center gap-3">
      <Button onClick={handleClick} disabled={loading || isPending}>
        {loading || isPending ? "取得中…" : "このジャンルのランキングを取得"}
      </Button>
      {ok === true && <span className="text-sm text-green-600">完了しました</span>}
      {ok === false && (
        <span className="text-sm text-red-600">失敗しました{error ? `: ${error}` : ""}</span>
      )}
    </div>
  );
}
