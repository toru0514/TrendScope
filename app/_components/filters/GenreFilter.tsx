"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type GenreOption = { id: string; label: string };

const GENRE_GROUPS: GenreOption[] = [
  { id: "100486", label: "レディースジュエリー・アクセサリー" },
  { id: "407326", label: "メンズジュエリー・アクセサリー" },
  { id: "301966", label: "ペアアクセサリー" },
  { id: "508586", label: "男女兼用アクセサリー" },
  { id: "551853", label: "ブライダルジュエリー" },
  { id: "407279", label: "ボディピアス" },
  { id: "567432", label: "タトゥーシール" },
  { id: "407455", label: "アクセサリー用品" },
  { id: "207030", label: "ルースストーン" },
  { id: "559284", label: "その他アクセサリー" },
];

const DEFAULT_PARENT = GENRE_GROUPS[0];

export default function GenreFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [parentId, setParentId] = useState<string>(DEFAULT_PARENT.id);
  const [childId, setChildId] = useState<string>(DEFAULT_PARENT.id);
  const [childOptions, setChildOptions] = useState<GenreOption[]>([]);
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef<Record<string, GenreOption[]>>({});
  const initialized = useRef(false);

  const parentLabel = useMemo(
    () => GENRE_GROUPS.find((g) => g.id === parentId)?.label ?? "",
    [parentId]
  );

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initialGenre = searchParams.get("genre");
    if (!initialGenre) {
      setParentId(DEFAULT_PARENT.id);
      setChildId(DEFAULT_PARENT.id);
      return;
    }

    if (GENRE_GROUPS.some((g) => g.id === initialGenre)) {
      setParentId(initialGenre);
      setChildId(initialGenre);
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `/api/rakuten/genres?genreId=${encodeURIComponent(initialGenre)}`
        );
        const json = await res.json();
        if (!json?.ok) {
          throw new Error(json?.error ?? "genre lookup failed");
        }
        const parents: GenreOption[] = Array.isArray(json?.data?.parents)
          ? json.data.parents.map((p: any) => ({
              id: String(p.id),
              label: String(p.name ?? ""),
            }))
          : [];
        const matchedParent = parents.find((p) =>
          GENRE_GROUPS.some((group) => group.id === p.id)
        );
        if (matchedParent) {
          setParentId(matchedParent.id);
          setChildId(initialGenre);
        } else {
          setParentId(DEFAULT_PARENT.id);
          setChildId(DEFAULT_PARENT.id);
        }
      } catch (e) {
        console.error("genre lookup failed", e);
        setParentId(DEFAULT_PARENT.id);
        setChildId(DEFAULT_PARENT.id);
      }
    })();
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function loadChildren(id: string) {
      const cached = cacheRef.current[id];
      if (cached) {
        setChildOptions(cached);
        setChildId((prev) =>
          prev && cached.some((c) => c.id === prev) ? prev : id
        );
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `/api/rakuten/genres?parentId=${encodeURIComponent(id)}`
        );
        const json = await res.json();
        if (!json?.ok) {
          throw new Error(json?.error ?? "genre children fetch failed");
        }
        if (!cancelled) {
          const options: GenreOption[] = Array.isArray(json?.data?.children)
            ? json.data.children.map((c: any) => ({
                id: String(c.id),
                label: String(c.name ?? ""),
              }))
            : [];
          cacheRef.current[id] = options;
          setChildOptions(options);
          setChildId((prev) =>
            prev && options.some((c) => c.id === prev) ? prev : id
          );
        }
      } catch (e) {
        console.error("genre children fetch failed", e);
        if (!cancelled) {
          cacheRef.current[id] = [];
          setChildOptions([]);
          setChildId(id);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadChildren(parentId);

    return () => {
      cancelled = true;
    };
  }, [parentId]);

  const allOptions: GenreOption[] = useMemo(() => {
    const totalOption: GenreOption = {
      id: parentId,
      label: `${parentLabel || "選択中ジャンル"} 全体`,
    };
    return [totalOption, ...childOptions];
  }, [childOptions, parentId, parentLabel]);

  const handleParentChange = (value: string) => {
    setParentId(value);
    setChildId(value);
    const url = new URL(window.location.href);
    url.searchParams.set("genre", value);
    router.push(url.toString());
  };

  const handleChildChange = (value: string) => {
    setChildId(value);
    const url = new URL(window.location.href);
    url.searchParams.set("genre", value);
    router.push(url.toString());
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="text-sm text-muted-foreground">ジャンル</label>
      <Select value={parentId} onValueChange={handleParentChange}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="ジャンルカテゴリを選択" />
        </SelectTrigger>
        <SelectContent>
          {GENRE_GROUPS.map((g) => (
            <SelectItem key={g.id} value={g.id}>
              {g.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={childId}
        onValueChange={handleChildChange}
        disabled={loading && allOptions.length <= 1}
      >
        <SelectTrigger className="w-64">
          <SelectValue placeholder="細分類を選択" />
        </SelectTrigger>
        <SelectContent>
          {allOptions.map((opt) => (
            <SelectItem key={opt.id} value={opt.id}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
