// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { clerkRequest } from './client.js';

export const clerkGetOrganization = tool({
  description:
    'Gets one Clerk organization by ID (org_xxx) or slug: name, slug, verified domains, logo, metadata, and member counts.',
  inputSchema: z.object({
    clerkToken: z.string().optional().describe('Clerk secret key (injected by system)'),
    organizationId: z.string().describe('Organization ID (org_...) or slug, e.g. \"acme-inc\"'),
  }),
  execute: async ({ clerkToken, organizationId }) => {
    const result = await clerkRequest(clerkToken, `/organizations/${organizationId}`);
    if (result.error) return result;
    return result.data;
  },
});
