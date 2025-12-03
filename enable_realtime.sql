begin;
  -- Ensure the publication exists
  insert into pg_publication (pubname) values ('supabase_realtime')
  on conflict (pubname) do nothing;

  -- Add tables to the publication
  alter publication supabase_realtime add table messages;
  alter publication supabase_realtime add table conversations;
commit;
