-- Replace retired placeholders with the four supplied game bundles.
update public.games set active=false where id in ('space-sprint','puzzle-lab','arcade-dash');

insert into public.games (id,title,description,path,active) values
  ('bubble-hamsters','Bubble Hamsters','Match bubbles and help the hamsters.','/games/Bubble Hamsters.html',true),
  ('element-blocks','Element Blocks','Place blocks, clear lines, and build your score.','/games/Element Blocks.html',true),
  ('tower-crash-3d','Tower Crash 3D','Aim, launch, and bring the tower down.','/games/Tower Crash 3D.html',true)
on conflict (id) do update set title=excluded.title,description=excluded.description,path=excluded.path,active=excluded.active;
