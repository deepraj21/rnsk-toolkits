// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { clerkRequest, compact } from './client.js';

export const clerkUpdateOrganization = tool({
  description:
    'Updates a Clerk organization (PATCH). Only provided fields change — rename it, change the slug, logo, or name. Use addOrganizationMember / updateOrganizationMember for people.',
  inputSchema: z.object({
    clerkToken: z.string().optional().describe('Clerk secret key (injected by system)'),
    organizationId: z.string().describe('Organization ID or slug'),
    name: z.string().optional().describe('New organization name'),
    slug: z.string().optional().describe('New slug'),
    logoUrl: z.string().optional().describe('New logo URL'),
    maxAllowedMembers: z.number().optional().describe('New membership limit'),
    maxAllowedRole: z.string().optional().describe('New highest assignable role'),
  }),
  execute: async ({
    clerkToken,
    organizationId,
    name,
    slug,
    logoUrl,
    maxAllowedMembers,
    maxAllowedRole,
  }) => {
    const body = compact({
      name,
      slug,
      logo_url: logoUrl,
      max_allowed_members: maxAllowedMembers,
      max_allowed_role: maxAllowedRole,
    });

    if (Object.keys(body).length === 0) {
      return { error: 'No fields provided to update. Include at least one field to change.' };
    }

    const result = await clerkRequest(clerkToken, `/organizations/${organizationId}`, {
      method: 'PATCH',
      body,
    });
    if (result.error) return result;
    return result.data;
  },
});
