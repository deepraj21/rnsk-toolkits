// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformCreateWorkspace = tool({
  description:
    'Creates a new workspace in the account — returns its ID, which you can pass as workspaceId to typeformCreateForm. Needs the workspaces:write scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    name: z.string().min(1).describe('Name of the new workspace'),
  }),
  execute: async ({ typeformToken, name }) => {
    if (!name || !String(name).trim()) return { error: 'name is required.' };

    const result = await typeformRequest(typeformToken, '/workspaces', {
      method: 'POST',
      body: { name },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
