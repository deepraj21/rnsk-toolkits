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

export const supabaseAlphaCreateApiKey = tool({
  description:
    "Creates a 'publishable' or 'secret' API key for an existing Supabase project, optionally with a description; 'secret' keys can have customized JWT templates.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique reference ID of the Supabase project.'),
    name: z
      .string()
      .describe(
        "Name for the API key. Must start with a lowercase letter or underscore, followed only by lowercase alphanumeric characters or underscores. Example: 'my_api_key_01'.",
      ),
    type: z
      .enum(['publishable', 'secret'])
      .describe(
        "Specifies the type of API key: 'publishable' for client-side use or 'secret' for server-side operations.",
      ),
    description: z
      .string()
      .optional()
      .describe('Optional human-readable description for the API key.'),
    reveal: z
      .boolean()
      .optional()
      .describe(
        'If true, the full API key value is included in the response; otherwise secrets stay redacted.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, name, type, description, reveal }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(supabaseAccessToken, `/v1/projects/${encodeURIComponent(String(ref))}/api-keys`, {
      query: pickDefined({ reveal: reveal }),
      body: pickDefined({ name: name, type: type, description: description }),
    });
  },
});

export const supabaseAlphaDeleteApiKey = tool({
  description:
    'Permanently deletes a specific API key (identified by `id`) from a Supabase project (identified by `ref`), revoking its access.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    id: z
      .string()
      .describe('The unique identifier of the API key that needs to be deleted from the project.'),
    ref: z
      .string()
      .describe(
        'The unique reference ID of the Supabase project from which the API key is to be deleted.',
      ),
  }),
  execute: async ({ supabaseAccessToken, id, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbDelete(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/api-keys/${encodeURIComponent(String(id))}`,
    );
  },
});

export const supabaseAlphaUpdateApiKey = tool({
  description:
    "Updates an existing Supabase project API key's `description` and/or `secret_jwt_template` (which defines its `role`); does not regenerate the key string.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    id: z.string().describe('The unique identifier of the API key that needs to be updated.'),
    ref: z
      .string()
      .describe('The unique reference ID of the Supabase project to which the API key belongs.'),
    description: z.string().optional().describe('Optional new description for the API key.'),
  }),
  execute: async ({ supabaseAccessToken, id, ref, description }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPatch(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/api-keys/${encodeURIComponent(String(id))}`,
      { body: pickDefined({ description: description }) },
    );
  },
});

export const supabaseGetProjectApiKey = tool({
  description:
    "Retrieves details of a specific API key for a Supabase project by its UUID. Use when you need to inspect a single key's configuration, type, or metadata.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    id: z
      .string()
      .describe(
        "UUID of the API key (must be UUID format from publishable/secret type keys, not legacy key names like 'anon' or 'service_role'). You can get this ID from the List Project API Keys action.",
      ),
    ref: z
      .string()
      .describe(
        "The unique reference ID (20 alphanumeric characters) of your Supabase project. You can find this in your project's dashboard URL or by calling the List All Projects action.",
      ),
    reveal: z
      .boolean()
      .optional()
      .describe(
        "If true, reveals the full API key value in the response. If false or omitted, secret key values will be partially redacted. Per Supabase's security model, secrets are hidden by default.",
      ),
  }),
  execute: async ({ supabaseAccessToken, id, ref, reveal }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/api-keys/${encodeURIComponent(String(id))}`,
      { query: pickDefined({ reveal: reveal }) },
    );
  },
});

export const supabaseGetProjectApiKeys = tool({
  description:
    'Retrieves all API keys for an existing Supabase project, specified by its unique reference ID (`ref`); this is a read-only operation.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The unique reference ID (20 alphanumeric characters) of your Supabase project. You can find this in your project's dashboard URL or by calling the List All Projects action. The project must belong to the authenticated user.",
      ),
    reveal: z
      .boolean()
      .optional()
      .describe(
        "If true, reveals the full API key values in the response. If false or omitted, secret key values will be partially redacted. Per Supabase's security model, secrets are hidden by default.",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, reveal }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(supabaseAccessToken, `/v1/projects/${encodeURIComponent(String(ref))}/api-keys`, {
      query: pickDefined({ reveal: reveal }),
    });
  },
});

export const supabaseGetProjectLegacyApiKeys = tool({
  description:
    'Checks whether JWT-based legacy API keys (anon, service_role) are enabled for a Supabase project. This API endpoint is deprecated and may be removed in the future (returns HTTP 404 Not Found when unavailable). Deprecated by Supabase; returns HTTP 404 when the endpoint is removed.',
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
      `/v1/projects/${encodeURIComponent(String(ref))}/api-keys/legacy`,
    );
  },
});

export const supabaseUpdateApiKey = tool({
  description:
    "Updates an existing Supabase project API key's metadata including name, description, and JWT template configuration. This action modifies key properties without regenerating the actual key value. Use this action when you need to change a key's display name, update its description for better organization, or modify the JWT role template for secret-type keys. Note: This does not rotate or regenerate the key string itself - the key value remains unchanged unless explicitly revealed with reveal=true.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    id: z
      .string()
      .describe(
        "UUID of the API key to update (must be UUID format from publishable/secret type keys, not legacy key names like 'anon' or 'service_role'). You can get this ID from the List Project API Keys or Get Project API Key actions.",
      ),
    ref: z
      .string()
      .describe(
        "The unique reference ID (20 alphanumeric characters) of your Supabase project. You can find this in your project's dashboard URL or by calling the List All Projects action.",
      ),
    name: z
      .string()
      .optional()
      .describe(
        "New name for the API key. Must be 4-64 characters long and follow the pattern: lowercase letters, numbers, and underscores only, starting with a letter or underscore (e.g., 'my_api_key_2024').",
      ),
    reveal: z
      .boolean()
      .optional()
      .describe(
        "If true, reveals the full API key value in the response. If false or omitted, secret key values will be partially redacted. Per Supabase's security model, secrets are hidden by default.",
      ),
    description: z
      .string()
      .optional()
      .describe(
        'Optional new description for the API key to help identify its purpose or usage context.',
      ),
    secretJwtTemplate: z
      .record(z.any())
      .optional()
      .describe('Template for claims/config associated with JWT-style keys.'),
  }),
  execute: async ({
    supabaseAccessToken,
    id,
    ref,
    name,
    reveal,
    description,
    secretJwtTemplate,
  }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPatch(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/api-keys/${encodeURIComponent(String(id))}`,
      {
        query: pickDefined({ reveal: reveal }),
        body: pickDefined({
          name: name,
          description: description,
          secret_jwt_template: secretJwtTemplate,
        }),
      },
    );
  },
});

export const supabaseUpdateProjectLegacyApiKeys = tool({
  description:
    'Tool to disable or re-enable JWT-based legacy API keys (anon, service_role) for a Supabase project. Use when you need to toggle legacy API key access for security or migration purposes. Note: This API endpoint may be removed in the future - check for HTTP 404 Not Found if the endpoint is no longer available. Deprecated by Supabase; returns HTTP 404 when the endpoint is removed.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The unique reference ID (20 alphanumeric characters) of your Supabase project. You can find this in your project's dashboard URL or by calling the List All Projects action.",
      ),
    enabled: z
      .boolean()
      .describe(
        'Enable or disable JWT-based legacy API keys (anon, service_role). Set to true to enable, false to disable.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, enabled }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPut(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/api-keys/legacy`,
      { query: pickDefined({ enabled: enabled }) },
    );
  },
});
