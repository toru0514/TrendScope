"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const GENRES: Record<string, { id: string; label: string }> = {
  // 楽天ジャンルID（例）
  ladies_accessory: { id: "216129", label: "レディースアクセサリー" },
  pierce_earring:  { id: "216131", label: "ピアス・イヤリング" },
  necklace:         { id: "216133", label: "ネックレス" },
  bracelet:         { id: "216135", label: "ブレスレット" },
  ring:             { id: "216130", label: "指輪・リング" },
};

export default function GenreFilter() {
  const router = useRouter();
  const sp = useSearchParams();
  const current = sp.get("genre") ?? GENRES.ladies_accessory.id;

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-muted-foreground">ジャンル</label>
      <Select
        value={current}
        onValueChange={(v) => {
          const url = new URL(window.location.href);
          url.searchParams.set("genre", v);
          router.push(url.toString());
        }}
      >
        <SelectTrigger className="w-64">
          <SelectValue placeholder="ジャンルを選択" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(GENRES).map(g => (
            <SelectItem key={g.id} value={g.id}>{g.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
