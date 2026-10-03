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

export const supabaseCreateProjectSigningKey = tool({
  description:
    'Create a new signing key for JWT authentication in a Supabase project. The key is created in standby status by default and must be activated separately. New keys are created in standby status; activate separately.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The unique reference ID of the Supabase project. Can also be provided as 'project_ref'.",
      ),
    status: z
      .enum(['in_use', 'standby'])
      .optional()
      .describe('Status of a signing key in request.'),
    algorithm: z
      .enum(['EdDSA', 'ES256', 'RS256', 'HS256'])
      .describe(
        'The cryptographic algorithm to use for the signing key. HS256 is recommended for most use cases.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, status, algorithm }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/config/auth/signing-keys`,
      { body: pickDefined({ status: status, algorithm: algorithm }) },
    );
  },
});

export const supabaseGetLegacySigningKey = tool({
  description:
    'Retrieves the signing key information for the JWT secret imported as signing key for this project. This endpoint is deprecated and will be removed in the future; check for HTTP 404 Not Found which indicates the endpoint is no longer available. Deprecated by Supabase; returns HTTP 404 when the endpoint is removed.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The unique reference ID (20 alphanumeric characters) of your Supabase project. You can find this in your project's dashboard URL or by calling the List All Projects action.",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/config/auth/signing-keys/legacy`,
    );
  },
});

export const supabaseGetProjectSigningKeys = tool({
  description:
    'Tool to list all signing keys for a Supabase project. Use when you need to retrieve JWT signing keys for authentication verification or rotation management.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The unique reference ID (20 alphanumeric characters) of your Supabase project. You can find this in your project's dashboard URL or by calling the List All Projects action.",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/config/auth/signing-keys`,
    );
  },
});
