// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { netlifyRequest } from './client.js';

export const netlifyGetDeploy = tool({
  description:
    'Gets one Netlify deploy by id: state, branch, commit sha and message, published URLs, error message on failure, and required file digests for digest-based uploads.',
  inputSchema: z.object({
    netlifyToken: z.string().optional().describe('Netlify access token (injected by system)'),
    deployId: z.string().describe('Deploy id'),
  }),
  execute: async ({ netlifyToken, deployId }) => {
    const result = await netlifyRequest(netlifyToken, `/deploys/${deployId}`);
    if (result.error) return result;
    return result.data;
  },
});
