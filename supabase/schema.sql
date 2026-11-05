-- Linkedu.es: esquema completo con RLS (basado en la sección 4 de la especificación)
-- Ejecutar entero en Supabase > SQL Editor.

-- 1. TABLAS
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role varchar(20) check (role in ('docente','alumno','empresa')) not null,
  full_name text not null,
  email text unique not null,
  subject_area text default '',
  bio text default '',
  avatar_url text default '',
  created_at timestamptz default now() not null
);
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null default '',
  invite_code varchar(10) unique not null,
  is_public boolean default true not null,
  created_at timestamptz default now() not null
);
create table public.project_members (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status varchar(20) check (status in ('pendiente','aceptado')) default 'aceptado' not null,
  joined_at timestamptz default now() not null,
  unique (project_id, user_id)
);
create table public.resources (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  subject_area text not null,
  resource_type varchar(20) check (resource_type in ('external_link','file')) not null,
  link_url text not null,
  created_at timestamptz default now() not null
);
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now() not null
);

-- 2. PERFIL AUTOMÁTICO AL REGISTRARSE (lee los datos que envía el frontend en signUp)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role, subject_area)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'full_name', 'Usuario'),
          coalesce(new.raw_user_meta_data->>'role', 'alumno'),
          coalesce(new.raw_user_meta_data->>'subject_area', ''));
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. FUNCIONES AUXILIARES
create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as
$$ select role from public.profiles where id = auth.uid() $$;

-- Unirse a un proyecto (incluso privado) con su código de invitación
create or replace function public.join_project_by_code(code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare pid uuid;
begin
  if public.my_role() not in ('docente','alumno') then raise exception 'Tu rol no puede unirse a proyectos'; end if;
  select id into pid from public.projects where invite_code = upper(trim(code));
  if pid is null then raise exception 'Ese código no existe'; end if;
  insert into public.project_members (project_id, user_id, status) values (pid, auth.uid(), 'aceptado')
    on conflict (project_id, user_id) do update set status = 'aceptado';
  return pid;
end; $$;

-- 4. ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.resources enable row level security;
alter table public.messages enable row level security;

-- profiles: docentes y empresas visibles; el alumno solo para sí mismo y compañeros de proyecto
create policy "Directorio de docentes y empresas" on public.profiles for select to authenticated
  using (role in ('docente','empresa'));
create policy "Privacidad del alumno" on public.profiles for select to authenticated
  using (auth.uid() = id or (role = 'alumno' and exists (
    select 1 from public.project_members a join public.project_members b on a.project_id = b.project_id
    where a.user_id = auth.uid() and b.user_id = public.profiles.id)));
create policy "Editar perfil propio" on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- projects
create policy "Ver proyectos" on public.projects for select to authenticated
  using (is_public or owner_id = auth.uid() or exists (
    select 1 from public.project_members m where m.project_id = public.projects.id and m.user_id = auth.uid()));
create policy "Crear proyectos (docentes)" on public.projects for insert to authenticated
  with check (owner_id = auth.uid() and public.my_role() = 'docente');
create policy "Editar mis proyectos" on public.projects for update to authenticated using (owner_id = auth.uid());
create policy "Borrar mis proyectos" on public.projects for delete to authenticated using (owner_id = auth.uid());

-- project_members
create policy "Ver miembros" on public.project_members for select to authenticated using (true);
create policy "Solicitar ingreso o añadir al propietario" on public.project_members for insert to authenticated
  with check (user_id = auth.uid() and (status = 'pendiente' or exists (
    select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())));
create policy "Aceptar solicitudes" on public.project_members for update to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()));
create policy "Salir o rechazar" on public.project_members for delete to authenticated
  using (user_id = auth.uid() or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()));

-- resources
create policy "Lectura de recursos" on public.resources for select to authenticated using (true);
create policy "Publicar recursos (docentes)" on public.resources for insert to authenticated
  with check (owner_id = auth.uid() and public.my_role() = 'docente');
create policy "Editar mis recursos" on public.resources for update to authenticated using (owner_id = auth.uid());
create policy "Borrar mis recursos" on public.resources for delete to authenticated using (owner_id = auth.uid());

-- messages
create policy "Ver mis mensajes" on public.messages for select to authenticated
  using (sender_id = auth.uid() or receiver_id = auth.uid());
create policy "Enviar mensajes (docentes y empresas)" on public.messages for insert to authenticated
  with check (sender_id = auth.uid() and public.my_role() in ('docente','empresa'));
