-- PBCOMPANY 관리자 모드: Supabase SQL Editor에서 1회 실행
-- 이미 동일한 테이블 이름을 사용 중이라면 실행 전 스키마를 확인하세요.
create table if not exists public.admin_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.site_content (
  key text primary key,
  content text not null,
  updated_at timestamptz not null default now()
);
insert into public.site_content(key,content) values
('about_lead','PBCOMPANY는 변화하는 기술 환경 속에서 고객의 필요를 듣고, 실질적인 해결책을 고민합니다.'),
('about_p1','우리는 작은 아이디어도 소중하게 생각합니다. 명확한 소통과 꼼꼼한 접근을 바탕으로, 고객의 목표에 적합한 방향을 함께 찾아가고자 합니다.'),
('about_p2','신뢰를 바탕으로 오래 함께할 수 있는 기술 파트너가 되는 것이 PBCOMPANY가 지향하는 모습입니다.')
on conflict (key) do nothing;

alter table public.admin_accounts enable row level security;
alter table public.site_content enable row level security;
revoke all on public.admin_accounts from anon, authenticated;
revoke all on public.site_content from anon, authenticated;
grant select on public.admin_accounts to authenticated;
grant select on public.site_content to anon, authenticated;
grant update on public.site_content to authenticated;

drop policy if exists "Read own admin membership" on public.admin_accounts;
create policy "Read own admin membership" on public.admin_accounts
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Anyone can read site content" on public.site_content;
create policy "Anyone can read site content" on public.site_content
for select to anon, authenticated using (true);

drop policy if exists "Only admins update site content" on public.site_content;
create policy "Only admins update site content" on public.site_content
for update to authenticated
using (exists (select 1 from public.admin_accounts a where a.user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_accounts a where a.user_id = (select auth.uid())));

-- 관리자 지정: Authentication > Users에서 본인 User UID 복사 후
-- 아래의 0000...을 실제 UUID로 교체하여 별도로 실행하세요.
-- insert into public.admin_accounts(user_id) values ('00000000-0000-0000-0000-000000000000') on conflict do nothing;
