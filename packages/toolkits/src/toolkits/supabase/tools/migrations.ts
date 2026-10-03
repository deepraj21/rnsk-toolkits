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

export const supabaseApplyAMigration = tool({
  description:
    'Tool to apply database migrations to a Supabase project. Use when you need to execute SQL schema changes, create tables, alter columns, or run other DDL/DML operations as part of a tracked migration. This is a Beta feature in the Supabase Management API. Applies and tracks the migration; failures roll back. Restricted availability.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The unique reference ID of the Supabase project (e.g., 'pamqaklsszmjzugtywow'). Found in Project Settings > General > Reference ID.",
      ),
    name: z
      .string()
      .optional()
      .describe(
        'A unique name for the migration to track it in the migration history. If not provided, a default name will be assigned.',
      ),
    query: z
      .string()
      .describe(
        "The SQL migration query to execute against the project's database. Must be at least 1 character long.",
      ),
    rollback: z
      .string()
      .optional()
      .describe('Optional SQL query to rollback/undo this migration if needed.'),
    idempotencyKey: z
      .string()
      .optional()
      .describe(
        'A unique key to ensure the same migration is tracked only once. If provided, prevents duplicate migrations with the same key from being applied.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, name, query, rollback, idempotencyKey }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/database/migrations`,
      {
        body: pickDefined({
          name: name,
          query: query,
          rollback: rollback,
          idempotency_key: idempotencyKey,
        }),
      },
    );
  },
});

export const supabaseGetMigration = tool({
  description:
    'Retrieves a specific database migration entry from the migration history using its version identifier. Use when you need to inspect migration details, SQL statements, or rollback commands for a specific migration version.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The unique reference ID of the Supabase project. Must be exactly 20 lowercase alphanumeric characters (letters a-z and digits 0-9 only, no hyphens, underscores, or special characters). You can find this in your Supabase project URL (e.g., https://supabase.com/dashboard/project/<ref>) or by using the 'List all projects' API.",
      ),
    version: z
      .string()
      .describe(
        "The version identifier of the migration to fetch. Typically a timestamp-based identifier (e.g., '20260216042751').",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, version }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/database/migrations/${encodeURIComponent(String(version))}`,
    );
  },
});

export const supabaseListMigrationHistory = tool({
  description:
    "Retrieves the list of applied database migration versions for a Supabase project. Use this to track which migrations have been applied to the project's database. This is a read-only operation that requires the project reference ID.",
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
      `/v1/projects/${encodeURIComponent(String(ref))}/database/migrations`,
    );
  },
});

export const supabasePatchMigration = tool({
  description:
    "[Beta] Patches an existing entry in the project's migration history, updating the name or rollback script. Use this to correct migration metadata after the migration has been created.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        'The unique reference ID of the Supabase project (used in the URL path). Must be exactly 20 lowercase letters (a-z).',
      ),
    name: z
      .string()
      .optional()
      .describe('New name for the migration entry. Updates the display name in migration history.'),
    version: z
      .string()
      .describe(
        "The version identifier of the migration to patch (typically a timestamp like '20260216042751'). This is found in the migration history.",
      ),
    rollback: z
      .string()
      .optional()
      .describe(
        'SQL rollback script for the migration. Defines how to revert the migration changes.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, name, version, rollback }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPatch(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/database/migrations/${encodeURIComponent(String(version))}`,
      { body: pickDefined({ name: name, rollback: rollback }) },
    );
  },
});

export const supabaseUpsertMigration = tool({
  description:
    'Tool to upsert a database migration without applying it. Use when you need to track migration changes for a project. [Beta] This endpoint stores migration metadata without executing the SQL. Stores migration metadata without executing the SQL.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe("Project's unique reference identifier (20 lowercase letters)."),
    name: z
      .string()
      .optional()
      .describe('Optional name for the migration. Used for tracking and identification purposes.'),
    query: z
      .string()
      .describe(
        'The SQL migration query to be stored. This query will be tracked but not executed. Must be non-empty.',
      ),
    rollback: z
      .string()
      .optional()
      .describe('Optional rollback SQL query to undo this migration if needed.'),
    idempotencyKey: z
      .string()
      .optional()
      .describe(
        'A unique key to ensure the same migration is tracked only once. If provided, prevents duplicate migrations with the same key.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, name, query, rollback, idempotencyKey }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPut(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/database/migrations`,
      {
        body: pickDefined({
          name: name,
          query: query,
          rollback: rollback,
          idempotency_key: idempotencyKey,
        }),
      },
    );
  },
});
