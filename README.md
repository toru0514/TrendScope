
# Accessory Trends Starter (shadcn/ui 版)

Next.js 15 + Tailwind + shadcn 風 UI コンポーネントを同梱したスターターです。
- ダミーデータで即UI確認 → Supabase差し替えで本番化
- Radixベースの簡易 `Select` / `Tabs` / `Card` / `Table` / `Badge` を同梱

## Quick Start
```bash
pnpm i
pnpm dev
# http://localhost:3000
```

## 主要フォルダ
- `app/` … ダッシュボード (App Router)
- `components/ui/` … shadcn 風 UI
- `app/_mock/` … ダミーデータ

## Supabase 連携（後で）
- `supabase/schema.sql` を Supabase SQL Editor で実行
- `.env.local` に URL/Key を設定
