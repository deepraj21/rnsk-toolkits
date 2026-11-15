// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest } from './client.js';

export const trelloGetCurrentMember = tool({
  description:
    'Gets the Trello member behind the connected credentials — id, username, full name, initials, avatar, and the workspaces and boards they belong to. Use it to learn your own member id for assigning cards.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    fields: z.string().optional().describe('Comma-separated member fields (default "all")'),
    boards: z
      .string()
      .optional()
      .describe(
        'Board summary to include: "none", "open", "closed", "all", "members", "public", "starred"',
      ),
    organizations: z
      .string()
      .optional()
      .describe('Workspace summary: "none", "open", "closed", "all", "members", "public"'),
  }),
  execute: async ({ trelloCredentials, fields, boards, organizations }) => {
    const result = await trelloRequest(trelloCredentials, '/members/me', {
      query: { fields, boards, organizations },
    });
    if (result.error) return result;

    return result.data;
  },
});
