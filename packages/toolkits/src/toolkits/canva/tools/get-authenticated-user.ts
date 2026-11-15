// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest } from './client.js';

export const canvaGetAuthenticatedUser = tool({
  description:
    'Returns the user and team IDs behind the connected Canva access token. Use the user_id and team_id when mentioning users in comments ([user_id:team_id]) or attributing ownership.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
  }),
  execute: async ({ canvaToken }) => {
    const result = await canvaRequest(canvaToken, '/users/me');
    if (result.error) return result;

    return result.data ?? {};
  },
});
