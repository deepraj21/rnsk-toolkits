// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { netlifyRequest } from './client.js';

export const netlifyGetSubmission = tool({
  description:
    'Gets one Netlify form submission by id: the submitted field values, submitter email, and meta data (ip, user agent, referrer).',
  inputSchema: z.object({
    netlifyToken: z.string().optional().describe('Netlify access token (injected by system)'),
    submissionId: z.string().describe('Submission id'),
  }),
  execute: async ({ netlifyToken, submissionId }) => {
    const result = await netlifyRequest(netlifyToken, `/submissions/${submissionId}`);
    if (result.error) return result;
    return result.data;
  },
});
