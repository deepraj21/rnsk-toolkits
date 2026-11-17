// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformGetUser = tool({
  description:
    'Gets the Typeform account behind the connected token — alias, email address, and language. Use this to confirm which account is connected. Needs the accounts:read scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
  }),
  execute: async ({ typeformToken }) => {
    const result = await typeformRequest(typeformToken, '/me');
    if (result.error) return result;

    return result.data ?? {};
  },
});
