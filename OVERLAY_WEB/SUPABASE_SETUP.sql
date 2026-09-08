create extension if not exists pgcrypto;

create table if not exists public.mnr_overlay_channels (
  channel_id text primary key,
  write_token_hash bytea not null,
  read_token_hash bytea not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint mnr_overlay_channel_length check (char_length(channel_id) between 12 and 128),
  constraint mnr_overlay_payload_size check (octet_length(payload::text) <= 524288)
);

alter table public.mnr_overlay_channels enable row level security;
revoke all on table public.mnr_overlay_channels from public, anon, authenticated;

create or replace function public.publish_mnr_overlay(
  p_channel_id text,
  p_write_token text,
  p_read_token text,
  p_payload jsonb
) returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare changed integer := 0;
begin
  if char_length(coalesce(p_channel_id, '')) < 12
     or char_length(coalesce(p_write_token, '')) < 24
     or char_length(coalesce(p_read_token, '')) < 24
     or octet_length(coalesce(p_payload, '{}'::jsonb)::text) > 524288 then
    return false;
  end if;

  insert into public.mnr_overlay_channels (
    channel_id, write_token_hash, read_token_hash, payload, updated_at
  ) values (
    p_channel_id,
    digest(p_write_token, 'sha256'),
    digest(p_read_token, 'sha256'),
    p_payload,
    now()
  ) on conflict (channel_id) do nothing;

  update public.mnr_overlay_channels
     set payload = p_payload,
         read_token_hash = digest(p_read_token, 'sha256'),
         updated_at = now()
   where channel_id = p_channel_id
     and write_token_hash = digest(p_write_token, 'sha256');
  get diagnostics changed = row_count;
  return changed = 1;
end;
$$;

create or replace function public.read_mnr_overlay(
  p_channel_id text,
  p_read_token text
) returns jsonb
language sql
stable
security definer
set search_path = public, extensions
as $$
  select payload
    from public.mnr_overlay_channels
   where channel_id = p_channel_id
     and read_token_hash = digest(p_read_token, 'sha256')
   limit 1;
$$;

revoke all on function public.publish_mnr_overlay(text, text, text, jsonb) from public;
revoke all on function public.read_mnr_overlay(text, text) from public;
grant execute on function public.publish_mnr_overlay(text, text, text, jsonb) to anon, authenticated;
grant execute on function public.read_mnr_overlay(text, text) to anon, authenticated;
