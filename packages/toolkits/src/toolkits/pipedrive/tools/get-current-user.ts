// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pipedriveRequest } from './client.js';

export const pipedriveGetCurrentUser = tool({
  description:
    'Gets the Pipedrive user tied to the API token: name, email, company, locale, and permissions. Useful for confirming the token works and for finding the current user ID to set as owner on created items.',
  inputSchema: z.object({
    pipedriveApiToken: z.string().optional().describe('Pipedrive API token (injected by system)'),
  }),
  execute: async ({ pipedriveApiToken }) => {
    const result = await pipedriveRequest(pipedriveApiToken, '/api/v1/users/me');
    if (result.error) return result;
    return result.data;
  },
});
