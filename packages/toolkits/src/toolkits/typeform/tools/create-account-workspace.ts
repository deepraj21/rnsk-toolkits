// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformCreateAccountWorkspace = tool({
  description:
    'Creates a new workspace inside a specific Typeform organization (account) — returns its ID for use with the form and workspace tools. Needs the workspaces:write scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    accountId: z.string().min(1).describe('Account (organization) ID'),
    name: z.string().min(1).describe('Name of the new workspace'),
  }),
  execute: async ({ typeformToken, accountId, name }) => {
    if (!accountId) return { error: 'accountId is required.' };
    if (!name || !String(name).trim()) return { error: 'name is required.' };

    const result = await typeformRequest(
      typeformToken,
      `/accounts/${encodeURIComponent(accountId)}/workspaces`,
      { method: 'POST', body: { name } },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
