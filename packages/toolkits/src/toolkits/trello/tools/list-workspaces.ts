// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest, asList } from './client.js';

export const trelloListWorkspaces = tool({
  description:
    'Lists the Trello workspaces (organizations) the connected member belongs to. Returns each workspace’s id, name, and URL — use the workspace id to create boards inside it or list its boards.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    fields: z
      .string()
      .optional()
      .describe('Comma-separated workspace fields, e.g. "name,url,displayName"'),
    memberships: z
      .enum(['none', 'admin', 'normal', 'owner'])
      .optional()
      .describe('Include only workspaces with this membership type'),
    organizationFields: z
      .string()
      .optional()
      .describe('Alias for field selection on the workspace objects'),
    memberFields: z
      .string()
      .optional()
      .describe('Comma-separated member fields to include on memberships'),
  }),
  execute: async ({ trelloCredentials, fields, memberships, organizationFields, memberFields }) => {
    const result = await trelloRequest(trelloCredentials, '/members/me/organizations', {
      query: {
        fields,
        memberships,
        organization_fields: organizationFields,
        member_fields: memberFields,
      },
    });
    if (result.error) return result;

    return { workspaces: asList(result.data) };
  },
});
