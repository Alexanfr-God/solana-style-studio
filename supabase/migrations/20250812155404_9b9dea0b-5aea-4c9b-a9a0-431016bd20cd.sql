
-- 1) Таблица для одноразовых nonce
create table if not exists public.auth_nonces (
  id uuid primary key default gen_random_uuid(),
  address text not null,
  chain text not null, -- 'evm' | 'solana' | конкретное название сети
  nonce text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used boolean not null default false
);

-- Индексы для быстрых выборок
create index if not exists auth_nonces_address_idx on public.auth_nonces (address);
create index if not exists auth_nonces_chain_idx on public.auth_nonces (chain);
create index if not exists auth_nonces_expires_at_idx on public.auth_nonces (expires_at);

-- Включаем RLS (доступ будет из Edge Functions с service role, клиентским приложениям доступ не нужен)
alter table public.auth_nonces enable row level security;

-- Валидационный триггер на expires_at > now()
create or replace function public.validate_auth_nonce_expiry()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT') then
    if new.expires_at <= now() then
      raise exception 'expires_at must be in the future';
    end if;
  elsif (tg_op = 'UPDATE') then
    if new.expires_at <= now() then
      raise exception 'expires_at must be in the future';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_validate_auth_nonce_expiry on public.auth_nonces;
create trigger trg_validate_auth_nonce_expiry
before insert or update on public.auth_nonces
for each row
execute function public.validate_auth_nonce_expiry();

-- 2) Таблица профилей кошельков
create table if not exists public.wallet_profiles (
  id uuid primary key default gen_random_uuid(),
  chain text not null,
  wallet_address text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

-- Уникальность адреса в рамках сети
create unique index if not exists wallet_profiles_chain_address_uidx
  on public.wallet_profiles (chain, wallet_address);

-- RLS включаем, политики не добавляем (работа только через Edge Functions)
alter table public.wallet_profiles enable row level security;

-- Автообновление updated_at
drop trigger if exists trg_wallet_profiles_updated_at on public.wallet_profiles;
create trigger trg_wallet_profiles_updated_at
before update on public.wallet_profiles
for each row
execute function public.update_updated_at_column();
