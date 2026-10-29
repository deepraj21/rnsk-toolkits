// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pipedriveRequest } from './client.js';

export const pipedriveDeleteDeal = tool({
  description:
    'Deletes a Pipedrive deal (marks it as deleted). Use only when the user explicitly asks to remove or discard a deal.',
  inputSchema: z.object({
    pipedriveApiToken: z.string().optional().describe('Pipedrive API token (injected by system)'),
    dealId: z.number().describe('Deal ID to delete'),
  }),
  execute: async ({ pipedriveApiToken, dealId }) => {
    const result = await pipedriveRequest(pipedriveApiToken, `/api/v2/deals/${dealId}`, {
      method: 'DELETE',
    });
    if (result.error) return result;
    return { deleted: true, dealId };
  },
});
