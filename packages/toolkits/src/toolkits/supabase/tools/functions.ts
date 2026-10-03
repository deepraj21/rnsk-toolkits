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

export const supabaseCreateFunction = tool({
  description:
    'Creates a new serverless Edge Function for a Supabase project (identified by `ref`), requiring valid JavaScript/TypeScript in `body` and a project-unique `slug` identifier. Deprecated endpoint, prefer deploy; send the complete source in body.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe("Project's unique identifier (path parameter)."),
    body: z.string().describe('JavaScript or TypeScript source code for the Edge Function.'),
    name: z.string().describe('Human-readable name for the function.'),
    slug: z
      .string()
      .describe(
        "URL-friendly identifier for the function's route prefix. Must be unique within the project.",
      ),
    importMap: z
      .boolean()
      .optional()
      .describe('If true, enable import map for ES module resolution.'),
    verifyJwt: z
      .boolean()
      .optional()
      .describe(
        'If true, verify JWT in Authorization header before invoking the function. Set to false for public endpoints like webhooks.',
      ),
    entrypointPath: z
      .string()
      .optional()
      .describe(
        "Path to main function code, relative to project's functions directory. Defaults to `./index.ts` or `./index.js` in function's slug directory.",
      ),
    importMapPath: z
      .string()
      .optional()
      .describe(
        "Path to import map JSON, relative to project's functions directory; used if `import_map` is true. Defaults to `import_map.json` in function's slug directory.",
      ),
  }),
  execute: async ({
    supabaseAccessToken,
    ref,
    body,
    name,
    slug,
    importMap,
    verifyJwt,
    entrypointPath,
    importMapPath,
  }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    const query = buildQuery(
      pickDefined({
        slug,
        name,
        verify_jwt: verifyJwt,
        import_map: importMap,
        entrypoint_path: entrypointPath,
        import_map_path: importMapPath,
      }),
    );
    try {
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${encodeURIComponent(String(ref))}/functions${query}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${supabaseAccessToken}`, 'Content-Type': 'text/plain' },
          body: body === undefined ? undefined : String(body),
        },
      );
      const data = await parseResponse(response);
      if (!response.ok) return { error: `Supabase API error ${response.status}`, details: data };
      return data;
    } catch (error) {
      return {
        error: 'Error calling Supabase API',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

export const supabaseDeleteEdgeFunction = tool({
  description:
    'Deletes an Edge Function from a Supabase project by its slug. Use this action when you need to permanently remove a deployed Edge Function that is no longer needed or should be replaced. This action is irreversible \u2014 the function cannot be recovered once deleted, though you can redeploy it from source if needed. Deletion is irreversible; redeploy from source to restore.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('Project ref - unique identifier for the Supabase project.'),
    functionSlug: z
      .string()
      .describe('Function slug - URL-friendly identifier of the Edge Function to delete.'),
  }),
  execute: async ({ supabaseAccessToken, ref, functionSlug }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbDelete(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/functions/${encodeURIComponent(String(functionSlug))}`,
    );
  },
});

export const supabaseDeleteFunction = tool({
  description:
    'Permanently deletes a specific Edge Function (by `function_slug`) from a Supabase project (by `ref`); this action is irreversible and requires prior existence of both project and function. Deletion is irreversible; redeploy from source to restore.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        'The unique identifier of the Supabase project from which the function will be deleted.',
      ),
    functionSlug: z
      .string()
      .describe(
        'The unique identifier (slug) of the Edge Function to be deleted. This is typically the name given to the function upon creation.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, functionSlug }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbDelete(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/functions/${encodeURIComponent(String(functionSlug))}`,
    );
  },
});

export const supabaseDeployFunction = tool({
  description:
    'Deploys Edge Functions to a Supabase project using multipart upload. Multipart deploy; provide exactly one of file_content or file_url (plus optional slug and bundleOnly).',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('Supabase project reference ID (e.g. `qftqfrxipqlzcmjcatfc`).'),
    file: z
      .object({ name: z.string(), s3key: z.string(), mimetype: z.string() })
      .catchall(z.any())
      .optional()
      .describe(
        'File uploaded to Composio (via SDK/MCP). Supports both single TypeScript/JavaScript files and pre-built .zip archives. Use this for large files, binary content, or complex multi-file functions. NOTE: Provide ONLY ONE of file_content, file_url, or file - not multiple.',
      ),
    slug: z.string().optional().describe('Slug of the function to deploy.'),
    fileUrl: z
      .string()
      .optional()
      .describe(
        'Public URL to download the function code from. Supports GitHub raw URLs and other publicly accessible file URLs. NOTE: Provide ONLY ONE of file_content, file_url, or file - not multiple.',
      ),
    bundleOnly: z
      .boolean()
      .optional()
      .describe('If true, only bundle the function without publishing it.'),
    fileContent: z
      .string()
      .optional()
      .describe(
        'Raw TypeScript/JavaScript source code as a string. Ideal for simple functions or when code is generated dynamically. NOTE: Provide ONLY ONE of file_content, file_url, or file - not multiple.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, slug, bundleOnly, fileContent, fileUrl, file }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    if (!slug) return { error: 'A function slug is required for deploy.' };
    const sources = [
      fileContent !== undefined ? 'file_content' : null,
      fileUrl !== undefined ? 'file_url' : null,
      file !== undefined ? 'file' : null,
    ].filter(Boolean);
    if (sources.length !== 1)
      return {
        error: 'Provide exactly one of file_content or file_url.',
        message: `Received: ${sources.join(', ') || 'none'}. The Composio file reference is not supported; download it first and pass file_url or file_content.`,
      };
    try {
      let bytes;
      let filename = 'index.ts';
      if (fileContent !== undefined) {
        bytes = new TextEncoder().encode(String(fileContent));
      } else {
        const dl = await fetch(String(fileUrl));
        if (!dl.ok)
          return {
            error: `Failed to download file_url (HTTP ${dl.status})`,
            details: await dl.text().catch(() => ''),
          };
        bytes = new Uint8Array(await dl.arrayBuffer());
        const last = String(fileUrl).split('?')[0].split('/').pop();
        if (last) filename = last;
      }
      const form = new FormData();
      form.append('file', new Blob([bytes]), filename);
      const query = buildQuery({ slug, bundleOnly: bundleOnly === true ? '1' : bundleOnly });
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${encodeURIComponent(String(ref))}/functions/deploy${query}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${supabaseAccessToken}` },
          body: form,
        },
      );
      const data = await parseResponse(response);
      if (!response.ok) return { error: `Supabase API error ${response.status}`, details: data };
      return data;
    } catch (error) {
      return {
        error: 'Error calling Supabase API',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

export const supabaseGetFunction = tool({
  description:
    'Retrieves detailed information, metadata, configuration, and status for a specific Edge Function using its project reference ID and function slug.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The unique reference ID of the Supabase project. Must be exactly 20 lowercase alphanumeric characters (letters a-z and digits 0-9 only, no hyphens, underscores, or special characters). You can find this in your Supabase project URL (e.g., https://supabase.com/dashboard/project/<ref>) or by using the 'List all projects' API.",
      ),
    functionSlug: z.string().describe('The unique identifier (slug) for the Edge Function.'),
  }),
  execute: async ({ supabaseAccessToken, ref, functionSlug }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/functions/${encodeURIComponent(String(functionSlug))}`,
    );
  },
});

export const supabaseGetFunctionBody = tool({
  description:
    'Retrieves the source code (body) for a specified serverless Edge Function using its project reference and function slug; this is a read-only operation that does not execute the function or return runtime logs. Returns the deployed source; does not execute the function.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique reference ID of the Supabase project.'),
    functionSlug: z
      .string()
      .describe(
        "The unique identifier (slug) of the serverless Edge Function whose body is to be retrieved. This is typically the function's name.",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, functionSlug }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/functions/${encodeURIComponent(String(functionSlug))}/body`,
    );
  },
});

export const supabaseInvokeEdgeFunction = tool({
  description:
    'Tool to invoke a deployed Supabase Edge Function over HTTPS. Use for testing and debugging Edge Functions with configurable method, headers, body, and authentication. Invokes over HTTPS on the project host; resolves the anon or service_role key automatically unless apiKey is given.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    body: z
      .any()
      .optional()
      .describe(
        'Request body to send to the function. Can be a JSON object (dict) or a raw string.',
      ),
    method: z
      .enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
      .optional()
      .describe('HTTP method to use when invoking the function.'),
    headers: z
      .record(z.any())
      .optional()
      .describe('Optional additional headers to send with the request (e.g., Content-Type).'),
    authMode: z
      .enum(['anon', 'service_role', 'custom_bearer'])
      .optional()
      .describe(
        "Authorization mode: 'anon' uses the anon key, 'service_role' uses the service role key, 'custom_bearer' requires a custom Authorization header in the headers parameter.",
      ),
    projectRef: z
      .string()
      .describe('Unique reference ID of the Supabase project (used in the hostname).'),
    functionSlug: z.string().describe('Name/slug of the Edge Function to invoke.'),
    responseType: z
      .enum(['json', 'text', 'auto'])
      .optional()
      .describe(
        "Expected response format: 'json' parses as JSON, 'text' returns raw text, 'auto' attempts JSON first then falls back to text.",
      ),
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
    functionSlug,
    method,
    headers,
    body,
    authMode,
    responseType,
    apiKey,
  }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    const mode = authMode ?? 'anon';
    let key = apiKey;
    let headerAuth =
      headers && typeof headers === 'object'
        ? (headers.authorization ?? headers.Authorization)
        : undefined;
    if (!key && !headerAuth) {
      const resolved = await resolveApiKey(
        supabaseAccessToken,
        String(projectRef),
        mode === 'service_role' ? ['secret'] : ['publishable'],
      );
      if (resolved && typeof resolved === 'object' && 'error' in resolved) return resolved;
      key = resolved;
    }
    const hdrs = { ...(headers ?? {}) };
    const sendBody =
      body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body);
    if (sendBody !== undefined && !hdrs['Content-Type'] && !hdrs['content-type'])
      hdrs['Content-Type'] = 'application/json';
    if (key) {
      if (!hdrs.apikey && !hdrs['apikey']) hdrs.apikey = key;
      if (!headerAuth) hdrs.Authorization = `Bearer ${key}`;
    }
    try {
      const response = await fetch(
        `https://${projectRef}.supabase.co/functions/v1/${functionSlug}`,
        {
          method: method ?? 'POST',
          headers: hdrs,
          body: (method ?? 'POST') === 'GET' ? undefined : sendBody,
        },
      );
      const text = await response.text();
      const outHeaders = {};
      response.headers.forEach((v, k) => {
        outHeaders[k] = v;
      });
      let bodyJson = null;
      const want = responseType ?? 'auto';
      if (want === 'json' || want === 'auto') {
        try {
          bodyJson = text ? JSON.parse(text) : null;
        } catch {
          if (want === 'json')
            return {
              error: 'Function did not return JSON.',
              details: { status_code: response.status, body_text: text },
            };
        }
      }
      return {
        status_code: response.status,
        response_headers: outHeaders,
        body_text: text,
        body_json: bodyJson,
      };
    } catch (error) {
      return {
        error: 'Error invoking Supabase Edge Function',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

export const supabaseListFunctions = tool({
  description:
    "Lists metadata for all Edge Functions in a Supabase project (specified by 'ref'), excluding function code or logs; the project must exist. Returns metadata only, without code or logs.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique identifier of the Supabase project.'),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(supabaseAccessToken, `/v1/projects/${encodeURIComponent(String(ref))}/functions`);
  },
});

export const supabaseUpdateAFunction = tool({
  description:
    "Updates an existing Supabase Edge Function's properties (like name, slug, source code, JWT settings, import map) identified by project `ref` and `function_slug`, supporting plain text code or ESZIP for the body. Use RETRIEVE_A_FUNCTION_BODY action first to get the current source code, as this action requires sending the complete function code, not just the changes. Send the complete source in body, not just the changes.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique reference ID of the Supabase project.'),
    body: z
      .string()
      .optional()
      .describe(
        'New source code (e.g., Deno/TypeScript) or base64-encoded ESZIP content for the function, sent in the request body.',
      ),
    name: z
      .string()
      .optional()
      .describe(
        "Optional new name for the function. This value is sent in the request body as 'name'.",
      ),
    slug: z
      .string()
      .optional()
      .describe(
        "Optional new slug for the function. If provided as a query parameter, this changes the function's access URL.",
      ),
    importMap: z
      .boolean()
      .optional()
      .describe('Whether to use an import map for the function (query parameter).'),
    verifyJwt: z
      .boolean()
      .optional()
      .describe(
        "Specifies whether JWT verification should be enabled. This value is sent in the request body as 'verify_jwt'.",
      ),
    functionSlug: z
      .string()
      .describe('The current slug (unique identifier) of the Edge Function to be updated.'),
    entrypointPath: z
      .string()
      .optional()
      .describe('Path to the main Deno script for the function (query parameter).'),
    importMapPath: z.string().optional().describe('Path to the import map file (query parameter).'),
  }),
  execute: async ({
    supabaseAccessToken,
    ref,
    functionSlug,
    body,
    name,
    slug,
    importMap,
    verifyJwt,
    entrypointPath,
    importMapPath,
  }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    const query = buildQuery(
      pickDefined({
        slug,
        name,
        verify_jwt: verifyJwt,
        import_map: importMap,
        entrypoint_path: entrypointPath,
        import_map_path: importMapPath,
      }),
    );
    try {
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${encodeURIComponent(String(ref))}/functions/${encodeURIComponent(String(functionSlug))}${query}`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${supabaseAccessToken}`, 'Content-Type': 'text/plain' },
          body: body === undefined ? undefined : String(body),
        },
      );
      const data = await parseResponse(response);
      if (!response.ok) return { error: `Supabase API error ${response.status}`, details: data };
      return data;
    } catch (error) {
      return {
        error: 'Error calling Supabase API',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

export const supabaseUpdateFunctions = tool({
  description:
    'Tool to bulk update Edge Functions in a Supabase project. Use when you need to update multiple functions at once with new configurations such as status, version, or other properties. Idempotent bulk update; bump version manually.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('Supabase project reference ID.'),
    functions: z
      .array(
        z
          .object({
            id: z.string(),
            name: z.string(),
            slug: z.string(),
            status: z.enum(['ACTIVE', 'REMOVED', 'THROTTLED']),
            version: z.number().int(),
            created_at: z.number().int().optional(),
            import_map: z.boolean().optional(),
            verify_jwt: z.boolean().optional(),
            ezbr_sha256: z.string().optional(),
            entrypoint_path: z.string().optional(),
            import_map_path: z.string().optional(),
          })
          .catchall(z.any()),
      )
      .describe(
        'List of functions to update. Each function must have id, slug, name, status, and version.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, functions }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPut(supabaseAccessToken, `/v1/projects/${encodeURIComponent(String(ref))}/functions`, {
      body: functions,
    });
  },
});
