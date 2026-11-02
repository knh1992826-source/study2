-- Supabase SQL Editor에서 실행 (수업용: 닉네임 기반, 누구나 읽기/쓰기)
create table if not exists favorites (
  id bigint generated always as identity primary key,
  nickname text not null,
  kind text not null,          -- tour | heritage
  title text not null,
  detail text,
  created_at timestamptz default now()
);
create table if not exists chats (
  id bigint generated always as identity primary key,
  nickname text not null,
  role text not null,          -- user | assistant
  content text not null,
  tools jsonb,
  created_at timestamptz default now()
);
alter table favorites enable row level security;
alter table chats enable row level security;
create policy "demo all favorites" on favorites for all using (true) with check (true);
create policy "demo all chats" on chats for all using (true) with check (true);
