// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest } from './client.js';

export const mistralDeleteAgent = tool({
  description:
    'Deletes a Mistral agent. This is permanent — conversations and batch jobs referencing the agent will stop working, so confirm nothing critical depends on it first.',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    agentId: z.string().min(1).describe('Agent id to delete'),
  }),
  execute: async ({ mistralToken, agentId }) => {
    if (!agentId) return { error: 'agentId is required.' };

    const result = await mistralRequest(mistralToken, `/agents/${encodeURIComponent(agentId)}`, {
      method: 'DELETE',
    });
    if (result.error) return result;

    return { deleted: true, agentId, result: result.data ?? null };
  },
});
