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

export const supabaseCreateOrganization = tool({
  description:
    'Creates a new Supabase organization, which serves as a top-level container for projects, billing, and team access.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    name: z.string().describe('The name for the new organization.'),
  }),
  execute: async ({ supabaseAccessToken, name }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(supabaseAccessToken, `/v1/organizations`, { body: pickDefined({ name: name }) });
  },
});

export const supabaseGetAvailableRegions = tool({
  description:
    'Tool to get the list of available regions for creating a new Supabase project. Use when you need to determine which regions are available for project deployment, or to get region recommendations based on geographic location and instance size requirements. Note: This is a Beta endpoint.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    continent: z
      .enum(['NA', 'SA', 'EU', 'AF', 'AS', 'OC', 'AN'])
      .optional()
      .describe('Continent codes for regional recommendations.'),
    organizationSlug: z
      .string()
      .describe(
        'Slug of your organization. This is required to retrieve available regions for project creation.',
      ),
    desiredInstanceSize: z
      .enum([
        'pico',
        'nano',
        'micro',
        'small',
        'medium',
        'large',
        'xlarge',
        '2xlarge',
        '4xlarge',
        '8xlarge',
        '12xlarge',
        '16xlarge',
        '24xlarge',
        '24xlarge_optimized_memory',
        '24xlarge_optimized_cpu',
        '24xlarge_high_memory',
        '48xlarge',
        '48xlarge_optimized_memory',
        '48xlarge_optimized_cpu',
        '48xlarge_high_memory',
      ])
      .optional()
      .describe('Available instance sizes for Supabase projects.'),
  }),
  execute: async ({ supabaseAccessToken, continent, organizationSlug, desiredInstanceSize }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(supabaseAccessToken, `/v1/projects/available-regions`, {
      query: pickDefined({
        continent: continent,
        organization_slug: organizationSlug,
        desired_instance_size: desiredInstanceSize,
      }),
    });
  },
});

export const supabaseGetOrganization = tool({
  description:
    'Fetches comprehensive details for a specific Supabase organization using its unique slug.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    slug: z.string().describe('The unique, URL-friendly identifier of the organization.'),
  }),
  execute: async ({ supabaseAccessToken, slug }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(supabaseAccessToken, `/v1/organizations/${encodeURIComponent(String(slug))}`);
  },
});

export const supabaseListAllOrganizations = tool({
  description:
    'Lists all organizations (ID and name only) associated with the Supabase account, excluding project details within these organizations.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
  }),
  execute: async ({ supabaseAccessToken }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(supabaseAccessToken, `/v1/organizations`);
  },
});

export const supabaseListOrganizationMembers = tool({
  description:
    'Retrieves all members of a Supabase organization, identified by its unique slug, including their user ID, username, email, role, and MFA status.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    slug: z
      .string()
      .describe('The unique identifier (slug) of the organization for which to list members.'),
  }),
  execute: async ({ supabaseAccessToken, slug }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/organizations/${encodeURIComponent(String(slug))}/members`,
    );
  },
});
