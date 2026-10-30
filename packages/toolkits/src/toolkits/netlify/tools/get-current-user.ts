// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { netlifyRequest } from './client.js';

export const netlifyGetCurrentUser = tool({
  description:
    'Gets the Netlify user tied to the token: name, email, and id. Useful to confirm the token works and to discover account ids (the user object lists the accounts you belong to).',
  inputSchema: z.object({
    netlifyToken: z.string().optional().describe('Netlify access token (injected by system)'),
  }),
  execute: async ({ netlifyToken }) => {
    const result = await netlifyRequest(netlifyToken, '/user');
    if (result.error) return result;
    return result.data;
  },
});
