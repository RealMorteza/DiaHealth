create table if not exists public.app_settings (
  key text primary key,
  enabled boolean not null default false
);

insert into public.app_settings (key, enabled)
values ('questionnaire_enabled', false)
on conflict (key) do nothing;

alter table public.app_settings enable row level security;

drop policy if exists "Authenticated users can read app settings" on public.app_settings;
create policy "Authenticated users can read app settings"
on public.app_settings
for select
to authenticated
using (key = 'questionnaire_enabled');

drop policy if exists "Questionnaire admins can update app settings" on public.app_settings;
create policy "Questionnaire admins can update app settings"
on public.app_settings
for update
to authenticated
using (
  key = 'questionnaire_enabled'
  and (
    split_part(lower(coalesce(auth.jwt() ->> 'email', '')), '@', 1)
    in ('09154184247', '09364323736')
    or exists (
      select 1 from public.patient
      where auth_id = auth.uid()
        and phone in ('09154184247', '09364323736')
    )
  )
)
with check (
  key = 'questionnaire_enabled'
  and (
    split_part(lower(coalesce(auth.jwt() ->> 'email', '')), '@', 1)
    in ('09154184247', '09364323736')
    or exists (
      select 1 from public.patient
      where auth_id = auth.uid()
        and phone in ('09154184247', '09364323736')
    )
  )
);

grant select on public.app_settings to authenticated;
grant update (enabled) on public.app_settings to authenticated;
