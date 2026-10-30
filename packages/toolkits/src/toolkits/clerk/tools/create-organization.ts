// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { clerkRequest, compact } from './client.js';

export const clerkCreateOrganization = tool({
  description:
    'Creates an organization (B2B tenant/workspace) in Clerk with a name and slug. Optionally set a verified domain so people with that email domain can join automatically. Returns the new organization with its org ID.',
  inputSchema: z.object({
    clerkToken: z.string().optional().describe('Clerk secret key (injected by system)'),
    name: z.string().describe('Organization name, e.g. \"Acme Inc\"'),
    slug: z.string().optional().describe('URL slug, e.g. \"acme-inc\" (defaults from name)'),
    createdByUserId: z
      .string()
      .optional()
      .describe('User ID to set as the creator/first admin of the organization'),
    maxAllowedMembers: z.number().optional().describe('Membership limit for the organization'),
    maxAllowedRole: z.string().optional().describe('Highest assignable role, e.g. \"org:admin\"'),
    publicMetadata: z.record(z.any()).optional().describe('Public metadata (readable client-side)'),
    privateMetadata: z.record(z.any()).optional().describe('Private metadata (server-only)'),
  }),
  execute: async ({
    clerkToken,
    name,
    slug,
    createdByUserId,
    maxAllowedMembers,
    maxAllowedRole,
    publicMetadata,
    privateMetadata,
  }) => {
    const result = await clerkRequest(clerkToken, '/organizations', {
      method: 'POST',
      body: compact({
        name,
        slug,
        created_by: createdByUserId,
        max_allowed_members: maxAllowedMembers,
        max_allowed_role: maxAllowedRole,
        public_metadata: publicMetadata,
        private_metadata: privateMetadata,
      }),
    });
    if (result.error) return result;
    return result.data;
  },
});
