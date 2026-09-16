-- Nascent is no longer a stored field on the theme. A theme reads as nascent
-- when it has fewer than 3 power tags, so roster_summary() must derive it
-- from the power tag count instead of reading theme->'nascent'.

create or replace function roster_summary(data jsonb) returns jsonb
language sql
immutable
as $$
  select jsonb_build_object(
    'themes', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'type', theme->>'type',
            'nascent', jsonb_array_length(
              case when jsonb_typeof(theme->'powerTags') = 'array' then theme->'powerTags' else '[]'::jsonb end
            ) < 3
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

-- A stored generated column does not recompute when the function body
-- changes, so touch every row to force it through the new definition.
update characters set data = data;
