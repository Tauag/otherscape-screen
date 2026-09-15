-- T58: roster_summary, a generated column carrying the roster's theme mix
-- sysdesign 3

create function roster_summary(data jsonb) returns jsonb
language sql
immutable
as $$
  select jsonb_build_object(
    'themes', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'type', theme->>'type',
            'nascent', coalesce(theme->'nascent' = 'true'::jsonb, false)
          )
          order by ord
        )
        from jsonb_array_elements(
          case when jsonb_typeof(data->'themes') = 'array' then data->'themes' else '[]'::jsonb end
        ) with ordinality as t(theme, ord)
      ),
      '[]'::jsonb
    ),
    'statuses', (
      select count(*)
      from jsonb_array_elements(
        case when jsonb_typeof(data->'statuses') = 'array' then data->'statuses' else '[]'::jsonb end
      ) as s(status)
      where status->'out' is distinct from 'true'::jsonb
    )
  );
$$;

alter table characters
  add column roster_summary jsonb generated always as (roster_summary(data)) stored;

comment on column characters.roster_summary is $$
Built by roster_summary() at write time. A stored generated column does not
recompute when the function body changes, so a shape change needs a new
migration that rewrites the column.
$$;
