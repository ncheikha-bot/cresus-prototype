-- Dépôt commun du prototype Crésus.
--
-- Une seule table : l'application range son état par clé, exactement comme dans
-- le stockage du navigateur. Rien à modéliser de plus tant que le prototype
-- n'est pas devenu une application à part entière.
--
-- À coller dans Supabase → SQL Editor → Run.

create table if not exists public.etat_partage (
  cle    text primary key,
  valeur jsonb not null,
  maj_le timestamptz not null default now()
);

alter table public.etat_partage enable row level security;

-- ATTENTION — démonstration ouverte.
--
-- Ces règles autorisent n'importe quel visiteur muni de l'URL à lire et écrire
-- l'état partagé : c'est ce qui permet à un client et à un administrateur de se
-- répondre sans compte. N'y mettez aucune donnée réelle : ni pièce d'identité,
-- ni coordonnées de personnes existantes. Pour une mise en service, il faudra
-- une authentification et des règles par utilisateur.
drop policy if exists "demo lecture" on public.etat_partage;
create policy "demo lecture"  on public.etat_partage for select using (true);

drop policy if exists "demo ecriture" on public.etat_partage;
create policy "demo ecriture" on public.etat_partage for insert with check (true);

drop policy if exists "demo maj" on public.etat_partage;
create policy "demo maj"      on public.etat_partage for update using (true) with check (true);

-- Diffusion en direct : sans cela, l'autre appareil ne verrait les changements
-- qu'au rechargement.
alter publication supabase_realtime add table public.etat_partage;
