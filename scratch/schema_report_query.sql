-- Run this in your Supabase SQL Editor to generate a complete schema report.
-- Copy the JSON result and paste it in chat if you want an automated audit of your live database state.

WITH table_list AS (
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
),
columns_list AS (
  SELECT
    table_name,
    json_agg(
      json_build_object(
        'column_name', column_name,
        'data_type', data_type,
        'is_nullable', is_nullable,
        'default', column_default
      ) ORDER BY ordinal_position
    ) AS columns
  FROM information_schema.columns
  WHERE table_schema = 'public'
  GROUP BY table_name
),
pks AS (
  SELECT
    tc.table_name,
    json_agg(kcu.column_name) AS primary_keys
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public'
  GROUP BY tc.table_name
),
fks AS (
  SELECT
    tc.table_name,
    json_agg(
      json_build_object(
        'column', kcu.column_name,
        'referenced_table', ccu.table_name,
        'referenced_column', ccu.column_name,
        'delete_rule', rc.delete_rule
      )
    ) AS foreign_keys
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
  JOIN information_schema.referential_constraints rc
    ON rc.constraint_name = tc.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
  GROUP BY tc.table_name
),
indexes_list AS (
  SELECT
    tablename AS table_name,
    json_agg(
      json_build_object(
        'index_name', indexname,
        'index_def', indexdef
      )
    ) AS indexes
  FROM pg_indexes
  WHERE schemaname = 'public'
  GROUP BY tablename
),
rls_status AS (
  SELECT
    c.relname AS table_name,
    c.relrowsecurity AS rls_enabled,
    c.relforcesecurity AS rls_forced
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r'
),
policies_list AS (
  SELECT
    tablename AS table_name,
    json_agg(
      json_build_object(
        'policy_name', policyname,
        'roles', roles,
        'cmd', cmd,
        'qual', qual,
        'with_check', with_check
      )
    ) AS policies
  FROM pg_policies
  WHERE schemaname = 'public'
  GROUP BY tablename
)
SELECT
  jsonb_pretty(
    json_agg(
      json_build_object(
        'table', t.table_name,
        'rls_enabled', COALESCE(r.rls_enabled, false),
        'columns', COALESCE(c.columns, '[]'::json),
        'primary_keys', COALESCE(p.primary_keys, '[]'::json),
        'foreign_keys', COALESCE(f.foreign_keys, '[]'::json),
        'indexes', COALESCE(idx.indexes, '[]'::json),
        'policies', COALESCE(pol.policies, '[]'::json)
      )
    )::jsonb
  ) AS schema_report
FROM table_list t
LEFT JOIN columns_list c ON t.table_name = c.table_name
LEFT JOIN pks p ON t.table_name = p.table_name
LEFT JOIN fks f ON t.table_name = f.table_name
LEFT JOIN indexes_list idx ON t.table_name = idx.table_name
LEFT JOIN rls_status r ON t.table_name = r.table_name
LEFT JOIN policies_list pol ON t.table_name = pol.table_name;
