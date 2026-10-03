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

export const supabaseBetaGetProjectNetworkBans = tool({
  description:
    'Retrieves the list of banned IPv4 addresses for a Supabase project using its unique project reference string; this is a read-only operation.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The unique project reference identifier for the Supabase project. Must be a valid 20-character project ref. You can retrieve valid project refs using the 'List all projects' action.",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/network-bans/retrieve`,
    );
  },
});

export const supabaseBetaGetProjectNetworkRestrictions = tool({
  description:
    'Retrieves the network restriction settings (IP allowlists) for a Supabase project. Use this action to: - Check which IPv4/IPv6 CIDR blocks are allowed to connect to the project\'s database - Verify if network restrictions are enabled (entitlement: "allowed") or disabled ("disallowed") - Audit current network security configuration - Check if network restrictions have been modified (old_config present) Note: Default values 0.0.0.0/0 (IPv4) and ::/0 (IPv6) mean all IPs are allowed. Network restrictions require a Pro, Team, or Enterprise plan. Requires a Pro, Team or Enterprise plan.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        'The unique project reference ID (also called project ID or ref). This is a 20-character alphanumeric string that identifies the Supabase project. Can be found in the project URL or retrieved via SUPABASE_LIST_ALL_PROJECTS.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/network-restrictions`,
    );
  },
});

export const supabaseBetaRemoveNetworkBans = tool({
  description:
    "Removes specified IPv4 addresses from a Supabase project's network ban list, granting immediate access; IPs not currently banned are ignored. Unbanned IPs regain access immediately; unknown IPs are ignored.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique reference ID of the Supabase project.'),
    ipv4Addresses: z
      .array(z.string())
      .describe("A list of IPv4 addresses to be removed from the project's network ban list."),
  }),
  execute: async ({ supabaseAccessToken, ref, ipv4Addresses }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbDelete(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/network-bans`,
      { body: pickDefined({ ipv4_addresses: ipv4Addresses }) },
    );
  },
});

export const supabaseBetaUpdateProjectNetworkRestrictions = tool({
  description:
    'Updates and applies network access restrictions (IPv4/IPv6 CIDR lists) for a Supabase project, which may terminate existing connections not matching the new rules. Replaces all restrictions; may drop existing connections.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('Unique reference ID of the Supabase project.'),
    dbAllowedCidrs: z
      .array(z.string())
      .optional()
      .describe(
        'List of IPv4 addresses or CIDR notations for database access; `[]` removes all IPv4 restrictions, `null`/omitted leaves current IPv4 restrictions unchanged.',
      ),
    dbAllowedCidrsV6: z
      .array(z.string())
      .optional()
      .describe(
        'List of IPv6 addresses or CIDR notations for database access; `[]` removes all IPv6 restrictions, `null`/omitted leaves current IPv6 restrictions unchanged.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, dbAllowedCidrs, dbAllowedCidrsV6 }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/network-restrictions/apply`,
      { body: pickDefined({ dbAllowedCidrs: dbAllowedCidrs, dbAllowedCidrsV6: dbAllowedCidrsV6 }) },
    );
  },
});

export const supabasePatchNetworkRestrictions = tool({
  description:
    "Updates project's network restrictions by incrementally adding or removing IPv4/IPv6 CIDR blocks. Use when you need to modify existing restrictions without replacing the entire configuration.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    add: z
      .object({
        dbAllowedCidrs: z.array(z.string()).optional(),
        dbAllowedCidrsV6: z.array(z.string()).optional(),
      })
      .catchall(z.any())
      .optional()
      .describe('Modification request for adding or removing network restriction CIDRs.'),
    ref: z
      .string()
      .describe('Unique reference ID of the Supabase project (visible in project URL).'),
    remove: z
      .object({
        dbAllowedCidrs: z.array(z.string()).optional(),
        dbAllowedCidrsV6: z.array(z.string()).optional(),
      })
      .catchall(z.any())
      .optional()
      .describe('Modification request for adding or removing network restriction CIDRs.'),
  }),
  execute: async ({ supabaseAccessToken, add, ref, remove }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPatch(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/network-restrictions`,
      { body: pickDefined({ add: add, remove: remove }) },
    );
  },
});
