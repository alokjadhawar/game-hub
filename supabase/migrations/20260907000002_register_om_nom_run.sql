-- Registers the supplied Om Nom Run HTML game and returns game paths to the public hub.
drop function if exists public.public_games();
create function public.public_games()
returns table(slug text,title text,description text,path text)
language sql stable security definer set search_path=public
as $$ select id,title,coalesce(description,''),path from public.games where active order by created_at $$;
revoke all on function public.public_games() from public,anon,authenticated;
grant execute on function public.public_games() to anon,authenticated;

insert into public.games (id,title,description,path,active)
values ('om-nom-run','Om Nom Run','Run, dodge, and chase a high score.','/games/Om Nom Run.html',true)
on conflict (id) do update set title=excluded.title,description=excluded.description,path=excluded.path,active=excluded.active;
