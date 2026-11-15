// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest } from './client.js';

export const mistralGetAgent = tool({
  description:
    'Gets one Mistral agent by id — instructions, model, tools, handoffs, and version. Optionally pin a specific version with agentVersion (integer version number or string alias).',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    agentId: z.string().min(1).describe('Agent id from mistralListAgents / mistralCreateAgent'),
    agentVersion: z
      .union([z.number(), z.string()])
      .optional()
      .describe('Version number (integer) or alias (string) to retrieve'),
  }),
  execute: async ({ mistralToken, agentId, agentVersion }) => {
    if (!agentId) return { error: 'agentId is required.' };

    const result = await mistralRequest(mistralToken, `/agents/${encodeURIComponent(agentId)}`, {
      query: { agent_version: agentVersion },
    });
    if (result.error) return result;

    return result.data;
  },
});
