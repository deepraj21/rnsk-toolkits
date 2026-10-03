// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
  buildQuery,
  parseResponse,
  pickDefined,
  resolveApiKey,
  sbDelete,
  sbGet,
  sbHead,
  sbOptions,
  sbPatch,
  sbPost,
  sbPut,
  tusOptions,
} from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const supabaseBetaGetProjectPgsodiumConfig = tool({
  description:
    'Retrieves the PGSodium configuration, including the root encryption key, for an existing Supabase project identified by its `ref`. Returns the root encryption key; handle it as a secret.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique identifier of the Supabase project.'),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(supabaseAccessToken, `/v1/projects/${encodeURIComponent(String(ref))}/pgsodium`);
  },
});

export const supabaseBetaGetProjectSslEnforcementConfig = tool({
  description:
    'Retrieves the SSL enforcement configuration for a specified Supabase project, indicating if SSL connections are mandated for its database.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The unique identifier of the Supabase project. This can typically be found in your project's dashboard URL (e.g., `https://supabase.com/dashboard/project/<project-ref>`).",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/ssl-enforcement`,
    );
  },
});

export const supabaseBetaRunSqlQuery = tool({
  description:
    "Executes a given SQL query against the project's database; use for advanced data operations or when standard API endpoints are insufficient, ensuring queries are valid PostgreSQL and sanitized. Use the get_table_schemas or generate_type_script_types tool to retrieve the table schema, then base your query on it. Experimental endpoint subject to change.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The unique reference ID of the Supabase project (used in the URL path). Must be exactly 20 lowercase letters (a-z). Can be found in Project Settings > General > Reference ID in the Supabase Dashboard, or from the dashboard URL: https://supabase.com/dashboard/project/<project-ref>. Can also be provided as 'project_ref'.",
      ),
    query: z
      .string()
      .describe(
        "The SQL query to be executed against the project's database. Can also be provided as 'sql'. CRITICAL - Single Quote Handling: Single quotes that delimit SQL string literals (e.g., 'John', '3 days') work normally when transmitted via JSON. However, apostrophes and single quotes WITHIN string content MUST be escaped using PostgreSQL's standard escaping (doubling the quote: ''). Examples: \u2713 CORRECT: SELECT 'I''m here' (apostrophe in content is escaped as '') \u2713 CORRECT: INSERT INTO users (bio) VALUES ('She said ''hello''') \u2713 CORRECT: SELECT '{ \"msg\": \"I''m ready\" }'::jsonb (apostrophe inside JSON string is escaped) \u2717 WRONG: SELECT 'I'm here' (syntax error - apostrophe breaks the string) \u2717 WRONG: SELECT '{ \"msg\": \"I'm ready\" }'::jsonb (syntax error in JSON content) IMPORTANT - PostgreSQL Array Syntax: For columns of type text[], integer[], etc., do NOT use JSON array syntax like '[\"item1\", \"item2\"]' as PostgreSQL will reject it. Use PostgreSQL array syntax instead: (1) ARRAY constructor: ARRAY['item1', 'item2'], or (2) Curly brace literal: '{\"item1\", \"item2\"}'. IMPORTANT - PostgreSQL Configuration Parameters: To reference Supabase secrets or config parameters, use current_setting() with the correct parameter name (e.g., current_setting('app.settings.my_secret')). Parameter names must not contain sanitization placeholders like '<URL>', '<IP_ADDRESS>', etc. Note: Complex DDL operations (CREATE TABLE with multiple indexes, CREATE VIEW with joins, large data migrations) may timeout if they exceed the Supabase API's internal timeout limit (~60 seconds). For long-running operations, consider breaking them into smaller queries or using a direct database connection.",
      ),
    readOnly: z
      .boolean()
      .optional()
      .describe(
        'If true, executes the query in a read-only transaction. Useful for safety when only fetching data without modifying the database. IMPORTANT: This parameter is incompatible with data modification statements. For INSERT, UPDATE, and DELETE statements, if set to true, it will be automatically overridden to false to allow the operation to proceed. For DDL statements (CREATE, ALTER, DROP, etc.), read_only=true will cause an error - you must set it to false or omit it.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, query, readOnly }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/database/query`,
      { body: pickDefined({ query: query, read_only: readOnly }) },
    );
  },
});

export const supabaseCreateLoginRole = tool({
  description:
    'Creates a temporary CLI login role for database access with specified permissions; use when setting up CLI authentication for development or administrative tasks. Returns a temporary password shown only once; store it securely.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('Project reference ID (unique identifier for the Supabase project).'),
    readOnly: z
      .boolean()
      .describe(
        'Whether the login role should have read-only permissions. Set to true for read-only access, false for full access.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, readOnly }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/cli/login-role`,
      { body: pickDefined({ read_only: readOnly }) },
    );
  },
});

export const supabaseDeleteLoginRoles = tool({
  description:
    '[Beta] Deletes existing login roles used by the Supabase CLI for the specified project. Use when you need to remove CLI authentication roles that were previously created for project access.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        'The unique project reference identifier for the Supabase project from which CLI login roles will be deleted.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbDelete(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/cli/login-role`,
    );
  },
});

export const supabaseGenerateTypescriptTypes = tool({
  description:
    "Generates and retrieves TypeScript types from a Supabase project's database; any schemas specified in `included_schemas` must exist in the project.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        'The unique reference ID of the Supabase project for which to generate TypeScript types.',
      ),
    includedSchemas: z
      .string()
      .optional()
      .describe(
        'Comma-separated database schema names to include in the generated TypeScript types.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, includedSchemas }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/types/typescript`,
      { query: pickDefined({ included_schemas: includedSchemas }) },
    );
  },
});

export const supabaseGetDatabaseMetadata = tool({
  description:
    'Gets database metadata for the given project. Returns information about databases, schemas, and tables structure. Note: This endpoint is deprecated and may be removed in future versions. Deprecated by Supabase; reads metadata through the SQL query endpoint.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        'Project ref. The unique reference ID of the Supabase project (visible in your Supabase project URL).',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    const enc = encodeURIComponent(String(ref));
    const res = await sbPost(supabaseAccessToken, `/v1/projects/${enc}/database/query`, {
      body: {
        query:
          "SELECT n.nspname AS name, jsonb_agg(jsonb_build_object('name', c.relname, 'columns', (SELECT jsonb_agg(jsonb_build_object('name', a.attname, 'type', format_type(a.atttypid, a.atttypmod), 'is_nullable', NOT a.attnotnull, 'has_default', a.atthasdef)) FROM pg_attribute a WHERE a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped), 'is_rls_enabled', c.relrowsecurity)) AS tables FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relkind IN ('r', 'p') AND n.nspname NOT IN ('pg_catalog', 'information_schema') AND n.nspname NOT LIKE 'pg_toast%' GROUP BY 1 ORDER BY 1",
      },
    });
    if (res && typeof res === 'object' && 'error' in res) return res;
    const rows = Array.isArray(res) ? res : (res?.result ?? []);
    return { databases: [{ name: 'postgres', schemas: rows }] };
  },
});

export const supabaseGetJitAccessConfig = tool({
  description:
    "[Beta] Retrieves the project's just-in-time (JIT) access configuration, including user roles and their expiration settings. Use this to check temporary access grants and their validity periods.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The unique reference ID of the Supabase project. Can also be provided as 'project_ref'.",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(supabaseAccessToken, `/v1/projects/${encodeURIComponent(String(ref))}/jit-access`);
  },
});

export const supabaseGetPerformanceAdvisors = tool({
  description:
    'Retrieves project performance advisors for a Supabase project. Returns a list of performance lints that identify potential issues and optimization opportunities. Note: This endpoint is deprecated. Deprecated by Supabase and may be removed.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The unique reference ID (20 alphanumeric characters) of your Supabase project. You can find this in your project's dashboard URL or by calling the List All Projects action. The project must belong to the authenticated user.",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/advisors/performance`,
    );
  },
});

export const supabaseGetProjectLogs = tool({
  description:
    'Retrieves analytics logs for a Supabase project. Use this to fetch and analyze project logs including edge function logs, database logs, and API logs for monitoring and debugging. Log SQL uses the ClickHouse dialect; keep ranges within 24 hours.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The unique reference ID (20 alphanumeric characters) of your Supabase project. You can find this in your project's dashboard URL or by calling the List All Projects action.",
      ),
    sql: z
      .string()
      .optional()
      .describe(
        'Custom SQL query to execute on the logs. Allows filtering, aggregation, and transformation of log data. See Supabase docs for querying logs for more details.',
      ),
    isoTimestampEnd: z
      .string()
      .optional()
      .describe(
        "End timestamp for filtering logs in ISO 8601 format (e.g., '2024-01-31T23:59:59Z'). Only logs before or at this timestamp will be included.",
      ),
    isoTimestampStart: z
      .string()
      .optional()
      .describe(
        "Start timestamp for filtering logs in ISO 8601 format (e.g., '2024-01-01T00:00:00Z'). Only logs on or after this timestamp will be included.",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, sql, isoTimestampEnd, isoTimestampStart }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/analytics/endpoints/logs`,
      {
        query: pickDefined({
          sql: sql,
          iso_timestamp_end: isoTimestampEnd,
          iso_timestamp_start: isoTimestampStart,
        }),
      },
    );
  },
});

export const supabaseGetProjectPgbouncerConfig = tool({
  description:
    'Retrieves the active PgBouncer configuration (PostgreSQL connection pooler) for a Supabase project, used for performance tuning, auditing, or getting the connection string.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique ID of the Supabase project.'),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/config/database/pgbouncer`,
    );
  },
});

export const supabaseGetProjectPostgresConfig = tool({
  description:
    "Retrieves the current read-only PostgreSQL database configuration for a specified Supabase project's `ref`, noting that some advanced or security-sensitive details might be omitted from the response.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique reference ID of the Supabase project.'),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/config/database/postgres`,
    );
  },
});

export const supabaseGetProjectPostgrestConfig = tool({
  description: 'Retrieves the PostgREST configuration for a specific Supabase project.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique identifier of the Supabase project.'),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(supabaseAccessToken, `/v1/projects/${encodeURIComponent(String(ref))}/postgrest`);
  },
});

export const supabaseGetProjectSupavisorConfig = tool({
  description:
    'Retrieves the Supavisor (connection pooler) configuration for a specified Supabase project, identified by its reference ID.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique reference ID of the Supabase project.'),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/config/database/pooler`,
    );
  },
});

export const supabaseGetSecurityAdvisors = tool({
  description:
    'Retrieves security advisor findings and recommendations for a Supabase project. Use when you need to audit project security posture, identify SQL-based security issues, or get remediation guidance. Note: This endpoint is deprecated and may be removed in future API versions. Deprecated by Supabase and may be removed.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The unique reference ID (20 alphanumeric characters) of your Supabase project. You can find this in your project's dashboard URL or by calling the List All Projects action.",
      ),
    lintType: z
      .enum(['sql'])
      .optional()
      .describe('Type of linting to perform for security advisors.'),
  }),
  execute: async ({ supabaseAccessToken, ref, lintType }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/advisors/security`,
      { query: pickDefined({ lint_type: lintType }) },
    );
  },
});

export const supabaseGetTableSchemas = tool({
  description:
    'Retrieves column details, types, and constraints for multiple database tables to help debug schema issues and write accurate SQL queries. Use the SUPABASE_LIST_TABLES action first to discover available tables, the fetch their detailed schemas. Reads schema metadata through the SQL query endpoint (up to 20 tables per call).',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    projectRef: z
      .string()
      .describe(
        'The unique reference ID of the Supabase project. This is visible in your Supabase project URL (e.g., https://supabase.com/dashboard/project/{project_ref}).',
      ),
    tableNames: z
      .array(z.string())
      .describe(
        "List of table names to retrieve schemas for. At least one table name is required (empty lists are not allowed). Tables can be from different schemas (e.g., 'public.users', 'operations.call_queue_items'). Without schema prefix, 'public' is assumed. Maximum 20 tables per request.",
      ),
    includeIndexes: z
      .boolean()
      .optional()
      .describe('Whether to include index information in the response'),
    excludeNullValues: z
      .boolean()
      .optional()
      .describe(
        'Whether to exclude properties with null values from the response for cleaner output',
      ),
    includeRelationships: z
      .boolean()
      .optional()
      .describe('Whether to include foreign key relationships in the response'),
  }),
  execute: async ({
    supabaseAccessToken,
    projectRef,
    tableNames,
    includeIndexes,
    includeRelationships,
  }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    const tables = [];
    const errors = [];
    for (const full of tableNames ?? []) {
      const parts = String(full).split('.');
      const schema = parts.length > 1 ? parts.slice(0, -1).join('.') : 'public';
      const table = parts.length > 1 ? parts[parts.length - 1] : parts[0];
      const colRes = await sbPost(
        supabaseAccessToken,
        `/v1/projects/${encodeURIComponent(String(projectRef))}/database/query`,
        {
          body: {
            query:
              'SELECT column_name, data_type, is_nullable, column_default, character_maximum_length, numeric_precision, numeric_scale, ordinal_position FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 ORDER BY ordinal_position',
            parameters: [schema, table],
          },
        },
      );
      if (colRes && typeof colRes === 'object' && 'error' in colRes) {
        errors.push({ table_name: String(full), error: colRes.error });
        continue;
      }
      const entry = {
        schema,
        schema_name: schema,
        name: table,
        table_name: table,
        full_name: `${schema}.${table}`,
        columns: Array.isArray(colRes) ? colRes : (colRes?.result ?? []),
      };
      if (includeIndexes !== false) {
        const idxRes = await sbPost(
          supabaseAccessToken,
          `/v1/projects/${encodeURIComponent(String(projectRef))}/database/query`,
          {
            body: {
              query:
                'SELECT indexname AS name, indexdef AS definition FROM pg_indexes WHERE schemaname = $1 AND tablename = $2',
              parameters: [schema, table],
            },
          },
        );
        if (!(idxRes && typeof idxRes === 'object' && 'error' in idxRes))
          entry.indexes = Array.isArray(idxRes) ? idxRes : (idxRes?.result ?? []);
      }
      if (includeRelationships !== false) {
        const fkRes = await sbPost(
          supabaseAccessToken,
          `/v1/projects/${encodeURIComponent(String(projectRef))}/database/query`,
          {
            body: {
              query:
                'SELECT tc.constraint_name, kcu.column_name AS source_column, ccu.table_schema AS target_schema, ccu.table_name AS target_table, ccu.column_name AS target_column FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema WHERE tc.constraint_type = $1 AND tc.table_schema = $2 AND tc.table_name = $3',
              parameters: ['FOREIGN KEY', schema, table],
            },
          },
        );
        if (!(fkRes && typeof fkRes === 'object' && 'error' in fkRes))
          entry.foreign_keys = Array.isArray(fkRes) ? fkRes : (fkRes?.result ?? []);
      }
      tables.push(entry);
    }
    return {
      tables,
      errors,
      total_found: tables.length,
      total_requested: (tableNames ?? []).length,
    };
  },
});

export const supabaseListBackups = tool({
  description:
    'Lists all database backups for a Supabase project, providing details on existing backups but not creating new ones or performing restores; availability may depend on plan and configuration.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique identifier (reference string) of the Supabase project.'),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/database/backups`,
    );
  },
});

export const supabaseListTables = tool({
  description:
    'Lists all tables and views in specified database schemas, providing a quick overview of database structure to help identify available tables before fetching detailed schemas. Reads table metadata through the SQL query endpoint.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    schemas: z
      .array(z.string())
      .optional()
      .describe(
        'List of schemas to search for tables (maximum 10). If not provided, lists tables from all non-system schemas. Specify schema names to limit the search to specific schemas.',
      ),
    projectRef: z
      .string()
      .describe(
        'The unique reference ID of the Supabase project. Must be exactly 20 lowercase letters (a-z only, no numbers or hyphens). This is visible in your Supabase project URL (e.g., https://supabase.com/dashboard/project/{project_ref}).',
      ),
    includeViews: z
      .boolean()
      .optional()
      .describe('Whether to include views along with tables in the results'),
    includeMetadata: z
      .boolean()
      .optional()
      .describe('Whether to include basic metadata like estimated row count and table size'),
    includeSystemSchemas: z
      .boolean()
      .optional()
      .describe(
        'Whether to include system schemas (pg_catalog, information_schema, etc.) when listing all schemas. When set to false, temporary and internal schemas such as pg_temp_*, pg_toast_temp_* and pgbouncer are excluded from the results.',
      ),
  }),
  execute: async ({
    supabaseAccessToken,
    projectRef,
    schemas,
    includeViews,
    includeMetadata,
    includeSystemSchemas,
  }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    const kinds = includeViews === false ? ['r', 'p'] : ['r', 'p', 'v', 'm'];
    let where = 'c.relkind = ANY($1)';
    const params = [kinds];
    if (schemas && schemas.length) {
      where += ' AND n.nspname = ANY($2)';
      params.push(schemas);
    } else if (includeSystemSchemas !== true) {
      where +=
        " AND n.nspname NOT IN ('pg_catalog', 'information_schema') AND n.nspname NOT LIKE 'pg_temp_%' AND n.nspname NOT LIKE 'pg_toast_temp_%' AND n.nspname <> 'pgbouncer'";
    }
    const res = await sbPost(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(projectRef))}/database/query`,
      {
        body: {
          query: `SELECT n.nspname AS schema_name, c.relname AS table_name, n.nspname || '.' || c.relname AS full_name, CASE WHEN c.relkind IN ('v', 'm') THEN 'VIEW' ELSE 'BASE TABLE' END AS table_type, pg_total_relation_size(c.oid) AS size_bytes, c.reltuples::bigint AS row_count FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE ${where} ORDER BY 1, 2`,
          parameters: params,
        },
      },
    );
    if (res && typeof res === 'object' && 'error' in res) return res;
    const rows = Array.isArray(res) ? res : (res?.result ?? []);
    const bySchema = {};
    for (const r of rows) {
      const s = r.schema_name;
      bySchema[s] = bySchema[s] || {
        schema_name: s,
        tables: [],
        table_count: 0,
        view_count: 0,
        total_size_bytes: 0,
      };
      const info = {
        schema_name: s,
        table_name: r.table_name,
        full_name: r.full_name,
        table_type: r.table_type,
      };
      if (includeMetadata !== false) {
        info.size_bytes = Number(r.size_bytes);
        info.row_count = Number(r.row_count);
      }
      bySchema[s].tables.push(info);
      if (r.table_type === 'VIEW') bySchema[s].view_count += 1;
      else bySchema[s].table_count += 1;
      bySchema[s].total_size_bytes += Number(r.size_bytes) || 0;
    }
    const list = Object.values(bySchema);
    return {
      schemas: list,
      tables: rows,
      total_schemas: list.length,
      total_tables: rows.filter((r) => r.table_type !== 'VIEW').length,
      total_views: rows.filter((r) => r.table_type === 'VIEW').length,
      query_metadata: {
        include_views: includeViews !== false,
        include_metadata: includeMetadata !== false,
        errors: null,
      },
    };
  },
});

export const supabaseRestorePitrBackup = tool({
  description:
    "Restores a Supabase project's database to a specific Unix timestamp using Point-in-Time Recovery (PITR), overwriting the current state; requires a paid plan with PITR and physical backups enabled. Overwrites the database; requires a paid plan with PITR enabled.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('Unique identifier of the Supabase project.'),
    recoveryTimeTargetUnix: z
      .number()
      .int()
      .describe('Unix timestamp (seconds) for the desired database restoration point.'),
  }),
  execute: async ({ supabaseAccessToken, ref, recoveryTimeTargetUnix }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/database/backups/restore-pitr`,
      { body: pickDefined({ recovery_time_target_unix: recoveryTimeTargetUnix }) },
    );
  },
});

export const supabaseRunReadOnlyQuery = tool({
  description:
    '[Beta] Run a SQL query as supabase_read_only_user. Use when you need to safely execute SELECT queries without risk of modifying data. Only read operations are allowed. Runs as supabase_read_only_user; all references must be schema-qualified.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The unique reference ID of the Supabase project (used in the URL path). Must be exactly 20 lowercase letters (a-z). Can be found in Project Settings > General > Reference ID in the Supabase Dashboard, or from the dashboard URL: https://supabase.com/dashboard/project/<project-ref>. Can also be provided as 'project_ref'.",
      ),
    query: z
      .string()
      .describe(
        "The SQL query to be executed as supabase_read_only_user. Only SELECT and other read-only operations are allowed. Write operations (INSERT, UPDATE, DELETE, CREATE, etc.) will be rejected. Can also be provided as 'sql'. IMPORTANT - Single Quote Handling: DO NOT double or escape single quotes in your SQL. The query is transmitted as a JSON string body, so standard SQL single quotes work directly. For example, write WHERE name = 'John' NOT WHERE name = ''John''.",
      ),
    parameters: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        'Optional array of parameters for parameterized queries. Use $1, $2, etc. in the query to reference parameters.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, query, parameters }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/database/query/read-only`,
      { body: pickDefined({ query: query, parameters: parameters }) },
    );
  },
});

export const supabaseSelectFromTable = tool({
  description:
    'Tool to select rows from a Supabase/PostgREST table. Use for read-only queries with filtering, sorting, and pagination. Reads through PostgREST on the project host using the publishable key (or apiKey override).',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    limit: z.number().int().optional().describe('Maximum number of rows to return (must be >= 1)'),
    order: z
      .string()
      .optional()
      .describe('Ordering expression in the form `column.asc` or `column.desc`'),
    table: z.string().describe('Table or view name to select from'),
    offset: z
      .number()
      .int()
      .optional()
      .describe('Number of rows to skip before returning results (must be >= 0)'),
    select: z
      .string()
      .describe(
        'Comma-separated list of columns to return. Supports nested/related selections and JSON path selectors (e.g., address->postcode).',
      ),
    filters: z
      .array(
        z
          .object({
            value: z.any(),
            column: z.string(),
            operator: z.enum([
              'eq',
              'neq',
              'gt',
              'gte',
              'lt',
              'lte',
              'like',
              'ilike',
              'is',
              'in',
              'cs',
              'cd',
              'sl',
              'sr',
              'nxl',
              'nxr',
              'adj',
              'ov',
              'fts',
              'plfts',
              'phfts',
              'wfts',
            ]),
          })
          .catchall(z.any()),
      )
      .optional()
      .describe(
        'Optional list of filters. Each filter will be rendered as `<column>_<operator>=<value>` in the query string (e.g., id_eq=123). Can be provided as a list of FilterItem objects. Each FilterItem must have: column (string), operator (one of: eq, neq, gt, gte, lt, lte, like, ilike, is, in, cs, cd, sl, sr, nxl, nxr, adj, ov, fts, plfts, phfts, wfts), and value (the comparison value).',
      ),
    projectRef: z
      .string()
      .describe('Unique reference ID of the Supabase project (used in the hostname)'),
    apiKey: z
      .string()
      .optional()
      .describe(
        'Optional project API key override. When omitted it is resolved automatically through the Management API.',
      ),
  }),
  execute: async ({
    supabaseAccessToken,
    projectRef,
    table,
    select,
    filters,
    order,
    limit,
    offset,
    apiKey,
  }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    let key = apiKey;
    if (!key) {
      const resolved = await resolveApiKey(supabaseAccessToken, String(projectRef), [
        'publishable',
      ]);
      if (resolved && typeof resolved === 'object' && 'error' in resolved) return resolved;
      key = resolved;
    }
    const params = new URLSearchParams();
    params.set('select', select);
    for (const f of filters ?? []) {
      if (!f || typeof f !== 'object') continue;
      const col = f.column;
      const op = f.operator;
      const val = f.value;
      if (!col || !op) continue;
      if (op === 'in' && Array.isArray(val))
        params.append(col, `in.(${val.map((v) => String(v)).join(',')})`);
      else if (op === 'is') params.append(col, `is.${val === null ? 'null' : String(val)}`);
      else params.append(col, `${op}.${val === null ? 'null' : String(val)}`);
    }
    if (order) params.set('order', order);
    if (limit !== undefined) params.set('limit', String(limit));
    if (offset !== undefined) params.set('offset', String(offset));
    try {
      const response = await fetch(
        `https://${projectRef}.supabase.co/rest/v1/${table}?${params.toString()}`,
        {
          headers: { apikey: String(key), Authorization: `Bearer ${String(key)}` },
        },
      );
      const text = await response.text();
      let rows = null;
      try {
        rows = text ? JSON.parse(text) : [];
      } catch {
        return { error: `PostgREST error ${response.status}`, details: text };
      }
      if (!response.ok) return { error: `PostgREST error ${response.status}`, details: rows };
      return {
        rows,
        diagnostics: {
          query_executed: true,
          table_queried: String(table),
          http_status_code: response.status,
          content_range_header: response.headers.get('content-range'),
        },
      };
    } catch (error) {
      return {
        error: 'Error calling Supabase PostgREST API',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

export const supabaseUpdateDatabasePassword = tool({
  description:
    'Updates the database password for a Supabase project. Use when needing to rotate credentials or recover database access. Rotating the password breaks existing connections until they are updated.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique reference ID of the Supabase project.'),
    password: z
      .string()
      .describe('The new database password to set. Must be at least 4 characters long.'),
  }),
  execute: async ({ supabaseAccessToken, ref, password }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPatch(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/database/password`,
      { body: pickDefined({ password: password }) },
    );
  },
});

export const supabaseUpdateJitAccessConfig = tool({
  description:
    "[Beta] Update a Supabase project's just-in-time (JIT) access configuration. Use to enable or disable JIT access features for privileged operations on the project.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('Unique reference ID of the Supabase project.'),
    state: z
      .enum(['enabled', 'disabled', 'unavailable'])
      .describe(
        "Desired just-in-time access state for the project. 'enabled' activates JIT access, 'disabled' deactivates it, 'unavailable' marks the feature as unavailable.",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, state }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPut(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/jit-access`,
      { body: pickDefined({ state: state }) },
    );
  },
});

export const supabaseUpdatePgsodiumConfig = tool({
  description:
    "Critically updates or initializes a Supabase project's pgsodium root encryption key for security setup or key rotation, requiring secure backup of the new key to prevent irreversible data loss. Rotating the root key can make data encrypted with the old key inaccessible; back it up first.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique identifier (ref ID) of the Supabase project.'),
    rootKey: z
      .string()
      .describe(
        'The new root encryption key for pgsodium. Must be a cryptographically strong key.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, rootKey }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPut(supabaseAccessToken, `/v1/projects/${encodeURIComponent(String(ref))}/pgsodium`, {
      body: pickDefined({ root_key: rootKey }),
    });
  },
});

export const supabaseUpdateProjectPostgresConfig = tool({
  description:
    'Updates specified PostgreSQL configuration parameters for an existing Supabase project (`ref`) to optimize database performance; note that unspecified parameters remain unchanged, and caution is advised as incorrect settings can impact stability or require a restart. Unspecified parameters stay unchanged; wrong values can force a restart.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique reference ID of the Supabase project.'),
    workMem: z
      .string()
      .optional()
      .describe(
        "Memory for internal sorts and hash tables before writing to temp disk files (e.g., '4MB', '64MB').",
      ),
    maxWalSize: z
      .string()
      .optional()
      .describe("WAL size that triggers a checkpoint (e.g., '1GB', '2048MB')."),
    walKeepSize: z
      .string()
      .optional()
      .describe(
        "Minimum size of past WAL log segments in pg_wal for standby servers (e.g., '128MB', '512MB'); replaces older wal_keep_segments.",
      ),
    sharedBuffers: z
      .string()
      .optional()
      .describe("Memory for shared memory buffers (e.g., '128MB', '1GB')."),
    maxConnections: z
      .number()
      .int()
      .optional()
      .describe('Maximum concurrent database connections. Typically between 1 and 262143.'),
    statementTimeout: z
      .string()
      .optional()
      .describe(
        "Maximum allowed duration for any SQL statement (e.g., '10000ms', '30s'); '0' typically disables timeout.",
      ),
    effectiveCacheSize: z
      .string()
      .optional()
      .describe("Estimated disk cache size for a single query (e.g., '4GB', '512MB')."),
    maintenanceWorkMem: z
      .string()
      .optional()
      .describe(
        "Maximum memory for maintenance operations like VACUUM, CREATE INDEX (e.g., '64MB', '1GB').",
      ),
    maxParallelWorkers: z
      .number()
      .int()
      .optional()
      .describe(
        'Maximum workers the system can support for parallel queries. Typically between 0 and 1024.',
      ),
    maxWorkerProcesses: z
      .number()
      .int()
      .optional()
      .describe(
        'Maximum background processes the system can support. Typically between 0 and 262143.',
      ),
    maxSlotWalKeepSize: z
      .string()
      .optional()
      .describe(
        "Maximum WAL file size replication slots can retain in pg_wal (e.g., '1GB', '512MB'). '0' might mean unlimited; check PostgreSQL docs.",
      ),
    sessionReplicationRole: z
      .enum(['local', 'origin', 'replica'])
      .optional()
      .describe(
        'Controls firing of replication-related triggers and rules for the current session.',
      ),
    maxLocksPerTransaction: z
      .number()
      .int()
      .optional()
      .describe(
        'Controls the average number of object locks allocated per transaction. Typically between 10 and 2147483640.',
      ),
    maxStandbyArchiveDelay: z
      .string()
      .optional()
      .describe(
        "Maximum delay before canceling queries on a hot standby server processing archived WAL data (e.g., '30s', '0ms' to disable).",
      ),
    maxStandbyStreamingDelay: z
      .string()
      .optional()
      .describe(
        "Maximum delay before canceling queries on a hot standby server processing streamed WAL data (e.g., '30s', '0ms' to disable).",
      ),
    maxParallelWorkersPerGather: z
      .number()
      .int()
      .optional()
      .describe(
        'Maximum workers for a single Gather or Gather Merge node in a parallel query. Typically between 0 and 1024.',
      ),
    maxParallelMaintenanceWorkers: z
      .number()
      .int()
      .optional()
      .describe(
        'Maximum parallel processes for a single maintenance utility command. Typically between 0 and 1024.',
      ),
  }),
  execute: async ({
    supabaseAccessToken,
    ref,
    workMem,
    maxWalSize,
    walKeepSize,
    sharedBuffers,
    maxConnections,
    statementTimeout,
    effectiveCacheSize,
    maintenanceWorkMem,
    maxParallelWorkers,
    maxWorkerProcesses,
    maxSlotWalKeepSize,
    sessionReplicationRole,
    maxLocksPerTransaction,
    maxStandbyArchiveDelay,
    maxStandbyStreamingDelay,
    maxParallelWorkersPerGather,
    maxParallelMaintenanceWorkers,
  }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPut(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/config/database/postgres`,
      {
        body: pickDefined({
          work_mem: workMem,
          max_wal_size: maxWalSize,
          wal_keep_size: walKeepSize,
          shared_buffers: sharedBuffers,
          max_connections: maxConnections,
          statement_timeout: statementTimeout,
          effective_cache_size: effectiveCacheSize,
          maintenance_work_mem: maintenanceWorkMem,
          max_parallel_workers: maxParallelWorkers,
          max_worker_processes: maxWorkerProcesses,
          max_slot_wal_keep_size: maxSlotWalKeepSize,
          session_replication_role: sessionReplicationRole,
          max_locks_per_transaction: maxLocksPerTransaction,
          max_standby_archive_delay: maxStandbyArchiveDelay,
          max_standby_streaming_delay: maxStandbyStreamingDelay,
          max_parallel_workers_per_gather: maxParallelWorkersPerGather,
          max_parallel_maintenance_workers: maxParallelMaintenanceWorkers,
        }),
      },
    );
  },
});

export const supabaseUpdateProjectPostgrestConfig = tool({
  description:
    'Updates PostgREST configuration settings (e.g., `max_rows`, `db_pool`, `db_schema`, `db_extra_search_path`) for a Supabase project to fine-tune API performance, data exposure, and database resource usage.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique identifier (reference) of the Supabase project.'),
    dbPool: z
      .number()
      .int()
      .optional()
      .describe(
        'The maximum number of connections in the PostgreSQL connection pool for PostgREST. If `null` or not provided, the pool size may be automatically configured based on compute size.',
      ),
    maxRows: z
      .number()
      .int()
      .optional()
      .describe(
        'The maximum number of rows PostgREST can return in a single response; this setting helps control payload size and query performance.',
      ),
    dbSchema: z
      .string()
      .optional()
      .describe(
        "A comma-separated string of PostgreSQL schemas to be exposed through the PostgREST API (e.g., 'public,api').",
      ),
    dbExtraSearchPath: z
      .string()
      .optional()
      .describe(
        'A comma-separated string of additional PostgreSQL schemas to search for objects if not found in the primary schema(s) defined by `db_schema`. An empty string can be used to clear existing paths.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, dbPool, maxRows, dbSchema, dbExtraSearchPath }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPatch(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/postgrest`,
      {
        body: pickDefined({
          db_pool: dbPool,
          max_rows: maxRows,
          db_schema: dbSchema,
          db_extra_search_path: dbExtraSearchPath,
        }),
      },
    );
  },
});

export const supabaseUpdateProjectSupavisorConfig = tool({
  description:
    'Updates the Supavisor (database pooler) configuration, such as `default_pool_size`, for an existing Supabase project identified by `ref`; the `pool_mode` parameter in the request is deprecated and ignored. pool_mode is deprecated and ignored by the API, so it is not sent.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique identifier of the Supabase project.'),
    poolMode: z
      .enum(['session', 'transaction'])
      .optional()
      .describe(
        'This field is deprecated and is ignored in this request. It previously controlled the pooling mode (session or transaction).',
      ),
    defaultPoolSize: z
      .number()
      .int()
      .optional()
      .describe(
        "Default number of connections per user for the connection pool; helps manage concurrent database connections and performance. Optimal value depends on project's compute add-on size and workload.",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, poolMode, defaultPoolSize }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPatch(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/config/database/pooler`,
      { body: pickDefined({ default_pool_size: defaultPoolSize }) },
    );
  },
});

export const supabaseUpdateSslEnforcementConfig = tool({
  description:
    "Updates the SSL enforcement configuration (enable/disable) for a specified Supabase project's database.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique identifier of the Supabase project.'),
    requestedConfigDatabase: z
      .boolean()
      .optional()
      .describe(
        "Desired SSL enforcement state for the project's database (`true` to enable, `false` to disable).",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, requestedConfigDatabase }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPut(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/ssl-enforcement`,
      { body: { requestedConfig: { database: requestedConfigDatabase } } },
    );
  },
});
