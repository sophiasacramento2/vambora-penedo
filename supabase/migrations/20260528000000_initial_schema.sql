-- ─── 1. EXTENSÕES E CONFIGURAÇÕES BASE ───
create extension if not exists "pgcrypto";
set timezone = 'America/Maceio';

-- ─── 2. TABELA: profiles (Usuários) ───
create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  full_name      text,
  phone          text,
  avatar_url     text,
  wallet_balance numeric(10,2) not null default 0.00 check (wallet_balance >= 0.00),
  created_at     timestamptz not null default now()
);

-- Trigger: cria profile automaticamente ao cadastrar usuário com search_path seguro
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public, pg_temp as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', 'Passageiro Vambora'),
    new.phone
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── 3. TABELA: routes (Linhas de Transporte) ───
create table public.routes (
  id              uuid primary key default gen_random_uuid(),
  name            text not null unique,
  type            text not null check (type in ('bus', 'van', 'ferry', 'boat')),
  origin          text not null,
  destination     text not null,
  fare            numeric(8,2) not null check (fare >= 0.00),
  duration_min    integer check (duration_min > 0),
  frequency       text,
  payment_methods text[] not null default '{}',
  polyline        jsonb, -- Array de coordenadas [[lat, lng], ...]
  color_token     text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

-- ─── 4. TABELA: stops (Pontos de Parada) ───
create table public.stops (
  id         uuid primary key default gen_random_uuid(),
  route_id   uuid not null references public.routes(id) on delete cascade,
  name       text not null,
  lat        numeric(10,7) not null,
  lng        numeric(10,7) not null,
  sequence   integer not null check (sequence >= 0),
  created_at timestamptz not null default now(),
  unique(route_id, sequence)
);

create index idx_stops_route_id on public.stops(route_id);

-- ─── 5. TABELA: schedules (Horários de Partida) ───
create table public.schedules (
  id              uuid primary key default gen_random_uuid(),
  route_id        uuid not null references public.routes(id) on delete cascade,
  day_type        text not null check (day_type in ('weekday', 'saturday', 'sunday_holiday')),
  departure_time  time not null,
  created_at      timestamptz not null default now(),
  unique(route_id, day_type, departure_time)
);

create index idx_schedules_route_id on public.schedules(route_id);
create index idx_schedules_day_type on public.schedules(day_type);

-- ─── 6. TABELA: reservations (Reservas) ───
create table public.reservations (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  route_id        uuid not null references public.routes(id) on delete restrict, -- Proteção contra órfãos
  schedule_id     uuid not null references public.schedules(id) on delete restrict,
  seats           integer not null default 1 check (seats >= 1 and seats <= 10),
  total_amount    numeric(10,2) not null check (total_amount >= 0.00),
  payment_method  text not null check (payment_method in ('cash', 'card', 'pix')),
  status          text not null default 'active' check (status in ('active', 'cancelled', 'completed')),
  reserved_at     timestamptz not null default now(),
  cancelled_at    timestamptz
);

create index idx_reservations_user_id on public.reservations(user_id);
create index idx_reservations_route_id on public.reservations(route_id);
create index idx_reservations_status on public.reservations(status);

-- ─── 7. TABELA: favorites (Favoritos) ───
create table public.favorites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  route_id   uuid not null references public.routes(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, route_id)
);

create index idx_favorites_user_id on public.favorites(user_id);

-- ─── 8. TABELA: alerts (Alertas Operacionais) ───
create table public.alerts (
  id         uuid primary key default gen_random_uuid(),
  route_id   uuid references public.routes(id) on delete set null,
  severity   text not null default 'info' check (severity in ('info', 'warning', 'danger')),
  title      text not null,
  body       text not null,
  created_at timestamptz not null default now()
);

create index idx_alerts_severity on public.alerts(severity);

-- ─── 9. TABELA: user_alerts_read (Leitura Individual de Alertas) ───
-- RESOLVE A BRECHA DE SEGURANÇA alerts_update_own_read E CORRIGE ERRO LÓGICO DE LEITURA COMPARTILHADA
create table public.user_alerts_read (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  alert_id   uuid not null references public.alerts(id) on delete cascade,
  read_at    timestamptz not null default now(),
  unique(user_id, alert_id)
);

create index idx_user_alerts_read_user_id on public.user_alerts_read(user_id);

-- ─── 10. TABELA: flow_events (Demanda de Tráfego Anônima) ───
create table public.flow_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete set null,
  route_id    uuid references public.routes(id) on delete cascade,
  destination text,
  occurred_at timestamptz not null default now()
);

create index idx_flow_events_route_id on public.flow_events(route_id);
create index idx_flow_events_occurred_at on public.flow_events(occurred_at);

-- ─── 11. TABELA: wallet_entries (Transações de Carteira) ───
create table public.wallet_entries (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  description     text not null,
  transport_type  text check (transport_type in ('bus', 'van', 'ferry', 'boat')),
  amount          numeric(8,2) not null check (amount > 0.00),
  direction       text not null check (direction in ('debit', 'credit')),
  created_at      timestamptz not null default now()
);

create index idx_wallet_entries_user_id on public.wallet_entries(user_id);

-- ─── 12. TRIGGER CONTÁBIL: ATUALIZAÇÃO AUTOMÁTICA DE SALDOS ───
-- GARANTE INTEGRIDADE ABSOLUTA DE SALDOS SEM CONFIAR NO FRONTEND
create or replace function public.update_wallet_balance()
returns trigger language plpgsql security definer
set search_path = public, pg_temp as $$
declare
  current_balance numeric(10,2);
begin
  select wallet_balance into current_balance from public.profiles where id = new.user_id;

  if (new.direction = 'credit') then
    update public.profiles 
    set wallet_balance = wallet_balance + new.amount 
    where id = new.user_id;
  elsif (new.direction = 'debit') then
    if (current_balance < new.amount) then
      raise exception 'Saldo insuficiente para realizar a transação';
    end if;
    update public.profiles 
    set wallet_balance = wallet_balance - new.amount 
    where id = new.user_id;
  end if;
  return new;
end;
$$;

create or replace trigger trigger_wallet_entry_inserted
  after insert on public.wallet_entries
  for each row execute procedure public.update_wallet_balance();

-- ─── 13. CONFIGURAÇÕES DE ROW LEVEL SECURITY (RLS) ───
alter table public.profiles       enable row level security;
alter table public.routes         enable row level security;
alter table public.stops          enable row level security;
alter table public.schedules      enable row level security;
alter table public.reservations   enable row level security;
alter table public.favorites      enable row level security;
alter table public.alerts         enable row level security;
alter table public.user_alerts_read enable row level security;
alter table public.flow_events    enable row level security;
alter table public.wallet_entries enable row level security;

-- PROFILES Policies
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- ROUTES, STOPS, SCHEDULES (Públicos p/ Leitura, Escrita bloqueada p/ API Pública)
create policy "routes_public_read" on public.routes for select using (true);
create policy "stops_public_read" on public.stops for select using (true);
create policy "schedules_public_read" on public.schedules for select using (true);

-- RESERVATIONS (Dono gerencia)
create policy "reservations_select_own" on public.reservations for select using (auth.uid() = user_id);
create policy "reservations_insert_own" on public.reservations for insert with check (auth.uid() = user_id);
create policy "reservations_update_own" on public.reservations for update using (auth.uid() = user_id);

-- FAVORITES (Dono gerencia)
create policy "favorites_select_own" on public.favorites for select using (auth.uid() = user_id);
create policy "favorites_insert_own" on public.favorites for insert with check (auth.uid() = user_id);
create policy "favorites_delete_own" on public.favorites for delete using (auth.uid() = user_id);

-- ALERTS (Públicos p/ Leitura, Alteração bloqueada p/ usuários comuns)
create policy "alerts_public_read" on public.alerts for select using (true);

-- USER_ALERTS_READ (Rastreamento individual de leitura)
create policy "user_alerts_read_select_own" on public.user_alerts_read for select using (auth.uid() = user_id);
create policy "user_alerts_read_insert_own" on public.user_alerts_read for insert with check (auth.uid() = user_id);

-- FLOW_EVENTS (Proteção contra spoofing de user_id)
create policy "flow_events_insert_safe" on public.flow_events for insert with check ((user_id is null) or (auth.uid() = user_id));
create policy "flow_events_select_own" on public.flow_events for select using (auth.uid() = user_id or user_id is null);

-- WALLET_ENTRIES (Visualização estrita do dono, inserção bloqueada via API direta para evitar fraudes de saldo)
create policy "wallet_entries_select_own" on public.wallet_entries for select using (auth.uid() = user_id);

-- ─── 14. SEED DE DADOS INICIAIS (RESILIENTE) ───
insert into public.routes (name, type, origin, destination, fare, duration_min, frequency, payment_methods, color_token) values
  ('Circular Centro ↔ Rodoviária', 'bus',   'Centro', 'Rodoviária',           3.50, 20,  'A cada 30 min', array['cash'],              '#E8621A'),
  ('Circular Centro ↔ Bairro Vermelho', 'bus', 'Centro', 'Bairro Vermelho',   3.50, 25,  'A cada 30 min', array['cash'],              '#E8621A'),
  ('Circular Centro ↔ Santa Luzia', 'bus',  'Centro', 'Santa Luzia',          3.50, 30,  'A cada 40 min', array['cash'],              '#E8621A'),
  ('Circular Centro ↔ SESI', 'bus',         'Centro', 'SESI',                 3.50, 20,  'A cada 40 min', array['cash'],              '#E8621A'),
  ('Van Penedo ↔ Arapiraca', 'van',         'Penedo', 'Arapiraca',           20.00, 60,  'Saídas fixas',  array['cash','pix'],        '#3B7DD8'),
  ('Van Penedo ↔ Maceió', 'van',            'Penedo', 'Maceió',              45.00, 90,  'Saídas fixas',  array['cash','pix'],        '#3B7DD8'),
  ('Van Penedo ↔ Igreja Nova', 'van',       'Penedo', 'Igreja Nova',         16.00, 40,  'Saídas fixas',  array['cash','pix'],        '#3B7DD8'),
  ('Balsa Penedo ↔ Neópolis', 'ferry',      'Penedo (AL)', 'Neópolis (SE)',    5.00, 15,  'A cada hora',   array['cash','pix'],        '#1A7A6E'),
  ('Barco Turístico ↔ Foz do São Francisco', 'boat', 'Penedo', 'Foz do São Francisco', 80.00, 180, 'Agendado', array['cash','pix','card'], '#1A7A6E')
on conflict (name) do nothing;

-- Inserir horários resilientes para o Circular Centro ↔ Rodoviária
with r as (select id from public.routes where name = 'Circular Centro ↔ Rodoviária')
insert into public.schedules (route_id, day_type, departure_time)
select r.id, 'weekday', t::time from r, unnest(array[
  '05:30','06:00','06:30','07:00','07:30','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','19:30'
]) as t
on conflict (route_id, day_type, departure_time) do nothing;

with r as (select id from public.routes where name = 'Circular Centro ↔ Rodoviária')
insert into public.schedules (route_id, day_type, departure_time)
select r.id, 'saturday', t::time from r, unnest(array[
  '06:00','07:00','08:00','09:00','10:00','11:00','12:00','14:00','16:00','18:00'
]) as t
on conflict (route_id, day_type, departure_time) do nothing;

with r as (select id from public.routes where name = 'Circular Centro ↔ Rodoviária')
insert into public.schedules (route_id, day_type, departure_time)
select r.id, 'sunday_holiday', t::time from r, unnest(array[
  '07:00','09:00','11:00','14:00','17:00'
]) as t
on conflict (route_id, day_type, departure_time) do nothing;

-- Alertas Seed de exemplo
insert into public.alerts (severity, title, body) values
  ('danger', 'Balsa parada por mau tempo', 'A travessia Penedo-Neópolis está suspensa por ventos fortes. Previsão de retorno às 14h.'),
  ('warning', 'Van atrasada — bloqueio na BR-101', 'Vans para Maceió saindo com atraso de 40 minutos devido a obra na rodovia.')
on conflict do nothing;
