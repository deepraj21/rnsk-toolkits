// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest } from './client.js';

export const mistralWhoami = tool({
  description:
    'Returns the identity behind the connected Mistral API key — the principal (user or service account), its type, and the organization/workspace the session is scoped to. Useful for confirming the key works and which tenant it belongs to.',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
  }),
  execute: async ({ mistralToken }) => {
    const result = await mistralRequest(mistralToken, '/whoami');
    if (result.error) return result;

    return result.data;
  },
});
