// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { netlifyRequest } from './client.js';

export const netlifyDeleteSubmission = tool({
  description:
    'Deletes a single Netlify form submission permanently. Use only when the user explicitly asks to remove it (e.g. a spam or GDPR deletion request).',
  inputSchema: z.object({
    netlifyToken: z.string().optional().describe('Netlify access token (injected by system)'),
    submissionId: z.string().describe('Submission id to delete'),
  }),
  execute: async ({ netlifyToken, submissionId }) => {
    const result = await netlifyRequest(netlifyToken, `/submissions/${submissionId}`, {
      method: 'DELETE',
    });
    if (result.error) return result;
    return { deleted: true, submissionId };
  },
});
