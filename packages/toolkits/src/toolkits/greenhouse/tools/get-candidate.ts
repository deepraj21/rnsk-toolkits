// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { greenhouseRequest } from './client.js';

export const greenhouseGetCandidate = tool({
  description:
    'Gets one Greenhouse candidate by id: name, company, title, tags, emails, phones, and addresses. Harvest v3 has no single-candidate GET, so this uses the candidates list with an ids filter.',
  inputSchema: z.object({
    greenhouseCredentials: z
      .string()
      .optional()
      .describe('Greenhouse Harvest API credentials "clientId:clientSecret" (injected by system)'),
    candidateId: z.number().describe('Greenhouse candidate id'),
  }),
  execute: async ({ greenhouseCredentials, candidateId }) => {
    const result = await greenhouseRequest(greenhouseCredentials, '/candidates', {
      query: { ids: String(candidateId) },
    });

    if (result.error) return result;

    const candidates = Array.isArray(result.data) ? result.data : [];
    if (!candidates.length) {
      return {
        error: `No candidate found with id ${candidateId}. It may be deleted or outside your permissions.`,
      };
    }
    return candidates[0];
  },
});
