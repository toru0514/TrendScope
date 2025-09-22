-- 1-1. 拡張カラム
add column if not exists point_rate int,
add column if not exists shop_name text,
add column if not exists shop_url text,
add column if not exists image_urls jsonb,
add column if not exists source_params jsonb;


-- 1-2. 分粒度キャプチャ（重複防止用）
alter table market_rankings
    add column if not exists captured_minute timestamptz
    generated always as (date_trunc('minute', captured_at)) stored;


create unique index if not exists uq_market_rankings_genre_rank_minute
    on market_rankings (platform, genre_id, rank, captured_minute);


-- 1-3. 最新バッチビュー
create or replace view latest_rankings as
with b as (
select platform, genre_id, max(date_trunc('minute', captured_at)) as t
from market_rankings
group by 1,2
)
select m.*
from market_rankings m
         join b on b.platform = m.platform
    and b.genre_id = m.genre_id
    and date_trunc('minute', m.captured_at) = b.t;


-- 1-4. 価格帯ビン
create or replace view v_price_bins as
select platform, genre_id,
       width_bucket(price::numeric, 0, 50000, 10) as bin,
       count(*) as cnt
from latest_rankings
where price is not null
group by 1,2,3;


-- 1-5. レビュー統計
create or replace view v_review_stats as
select platform, genre_id,
       avg(review_average::numeric) as avg_rating,
       percentile_cont(0.5) within group (order by review_average) as med_rating,
avg(review_count) as avg_review_count
from latest_rankings
group by 1,2;


-- 1-6. ショップ別上位
create or replace view v_top_shops as
select platform, genre_id, shop_name,
       count(*) as items,
       avg(price::numeric) as avg_price
from latest_rankings
where shop_name is not null
group by 1,2,3
order by items desc;