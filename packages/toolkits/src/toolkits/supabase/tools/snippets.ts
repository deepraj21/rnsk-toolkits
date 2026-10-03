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

export const supabaseGetSqlSnippet = tool({
  description: 'Retrieves a specific SQL snippet by its unique identifier.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    id: z.string().describe('The unique identifier of the SQL snippet to retrieve.'),
  }),
  execute: async ({ supabaseAccessToken, id }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(supabaseAccessToken, `/v1/snippets/${encodeURIComponent(String(id))}`);
  },
});

export const supabaseListSqlSnippets = tool({
  description:
    'Retrieves a list of SQL snippets for the logged-in user, optionally filtered by a specific Supabase project if `project_ref` is provided.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    projectRef: z
      .string()
      .optional()
      .describe(
        'The unique identifier for your Supabase project. It is a 20-digit string used to reference and manage your project in API endpoints. This can be found in Supabase Studio under Settings > General > Project Settings > Reference ID.',
      ),
  }),
  execute: async ({ supabaseAccessToken, projectRef }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(supabaseAccessToken, `/v1/snippets`, {
      query: pickDefined({ project_ref: projectRef }),
    });
  },
});
