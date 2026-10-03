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

export const supabaseCreateBulkSecrets = tool({
  description:
    'Tool to bulk create secrets for a Supabase project. Use when you need to create multiple project secrets at once. Each secret name must not start with SUPABASE_. Names must not start with SUPABASE_.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        'The unique reference ID (ref) of the Supabase project where secrets will be created.',
      ),
    secrets: z
      .array(z.object({ name: z.string(), value: z.string() }).catchall(z.any()))
      .describe(
        "List of secrets to create. Each secret must have a unique name that doesn't start with SUPABASE_.",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, secrets }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(supabaseAccessToken, `/v1/projects/${encodeURIComponent(String(ref))}/secrets`, {
      body: secrets,
    });
  },
});

export const supabaseDeleteSecrets = tool({
  description:
    'Deletes one or more secrets from a Supabase project by their names. This action is irreversible - deleted secrets cannot be recovered. Use this action when you need to remove environment variables or configuration secrets that are no longer needed or should be replaced. Supports both single and bulk deletion operations through the same endpoint. Deletion is irreversible.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        'The unique reference ID (ref) of the Supabase project whose secrets should be deleted.',
      ),
    secretNames: z
      .array(z.string())
      .describe(
        'List of secret names to delete. Each name must match an existing secret in the project.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, secretNames }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbDelete(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/secrets`,
      { body: secretNames },
    );
  },
});

export const supabaseListProjectSecrets = tool({
  description:
    'Retrieves all secrets (environment variables) for a Supabase project by its reference ID. Use this action when you need to view the secrets configured for a project, such as API keys, database URLs, or other environment variables. Note that secret values in the response may be masked for security reasons. Values may be masked digests, not plaintext.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        'The unique reference ID (ref) of the Supabase project whose secrets you want to list. This is a 20-character alphanumeric identifier visible in your project dashboard URL.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(supabaseAccessToken, `/v1/projects/${encodeURIComponent(String(ref))}/secrets`);
  },
});

export const supabaseListSecrets = tool({
  description:
    'Retrieves all secrets for a Supabase project using its reference ID; secret values in the response may be masked. Values may be masked digests, not plaintext.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        'The unique reference ID (ref) of the Supabase project whose secrets are to be retrieved.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(supabaseAccessToken, `/v1/projects/${encodeURIComponent(String(ref))}/secrets`);
  },
});
