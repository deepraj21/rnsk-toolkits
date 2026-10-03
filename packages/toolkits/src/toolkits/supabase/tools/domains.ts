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

export const supabaseBetaActivateCustomHostname = tool({
  description:
    'Activates a previously configured custom hostname for a Supabase project, assuming DNS settings are verified externally. Requires verified DNS first; prepare client code and OAuth providers for downtime.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique identifier (project ID) of the Supabase project.'),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/custom-hostname/activate`,
    );
  },
});

export const supabaseBetaActivateVanitySubdomain = tool({
  description:
    "Activates a vanity subdomain for the specified Supabase project (e.g., 'my-brand.supabase.co'). Important notes: - Vanity subdomains require a paid plan (Pro/Team/Enterprise) - Usage of vanity subdomains and custom domains is mutually exclusive - After activation, your project's auth services will no longer work on the original {project-ref}.supabase.co hostname - Schedule a downtime window to update client code and OAuth providers before activating Requires a paid plan; auth stops working on the original hostname.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('Unique reference ID of the Supabase project.'),
    vanitySubdomain: z
      .string()
      .describe(
        "Vanity subdomain to activate (e.g., 'my-example-brand'). Must be 1-63 alphanumeric characters or hyphens; cannot start or end with a hyphen.",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, vanitySubdomain }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/vanity-subdomain/activate`,
      { body: pickDefined({ vanity_subdomain: vanitySubdomain }) },
    );
  },
});

export const supabaseBetaCheckVanitySubdomainAvailability = tool({
  description:
    'Checks if a specific vanity subdomain is available for a Supabase project; this action does not reserve or assign the subdomain. Check only; it does not reserve the subdomain.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique reference ID of the Supabase project.'),
    vanitySubdomain: z
      .string()
      .describe(
        "The desired vanity subdomain to check for availability (e.g., 'my-app'). Must be 1-63 alphanumeric characters or hyphens; cannot start or end with a hyphen.",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, vanitySubdomain }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/vanity-subdomain/check-availability`,
      { body: pickDefined({ vanity_subdomain: vanitySubdomain }) },
    );
  },
});

export const supabaseBetaGetProjectCustomHostnameConfig = tool({
  description:
    "Retrieves a Supabase project's custom hostname configuration, including its status, SSL certificate, and ownership verification, noting that availability may depend on the project's plan.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The unique reference ID of the Supabase project. This ID can typically be found in your project's dashboard URL.",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/custom-hostname`,
    );
  },
});

export const supabaseBetaGetVanitySubdomainConfig = tool({
  description:
    'Fetches the current vanity subdomain configuration, including its status and custom domain name, for a Supabase project identified by its reference ID.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        'The unique reference ID of the Supabase project for which to fetch the vanity subdomain configuration.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/vanity-subdomain`,
    );
  },
});

export const supabaseDeleteCustomHostnameConfig = tool({
  description:
    'Deletes an active custom hostname configuration for the project identified by `ref`, reverting to the default Supabase-provided hostname; this action immediately makes the project inaccessible via the custom domain and requires subsequent updates to client, OAuth, and DNS settings. Clients must switch back to the Supabase hostname immediately.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        'The unique reference ID of the Supabase project for which the custom hostname configuration will be deleted.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbDelete(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/custom-hostname`,
    );
  },
});

export const supabaseDeleteProjectVanitySubdomain = tool({
  description:
    'Permanently and irreversibly deletes an active vanity subdomain configuration for the specified Supabase project, reverting it to its default Supabase URL. Reverts the project to its default Supabase URL.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique reference ID of the Supabase project.'),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbDelete(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/vanity-subdomain`,
    );
  },
});

export const supabaseUpdateProjectCustomHostname = tool({
  description:
    'Updates the custom hostname for a Supabase project, requiring subsequent DNS changes to a user-controlled domain for SSL certificate issuance and domain ownership. Follow with DNS changes, reverify, then activate.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique identifier of the Supabase project.'),
    customHostname: z
      .string()
      .describe(
        "Desired custom hostname (e.g., 'api.example.com') to associate with the project's services.",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, customHostname }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/custom-hostname/initialize`,
      { body: pickDefined({ custom_hostname: customHostname }) },
    );
  },
});

export const supabaseVerifyCustomHostnameDns = tool({
  description:
    'Re-verifies DNS and SSL configurations for an existing custom hostname associated with a Supabase project. DNS propagation can take up to 30 minutes; retry as needed.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        'The unique reference ID of the Supabase project for which the custom hostname is being re-verified.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/custom-hostname/reverify`,
    );
  },
});
