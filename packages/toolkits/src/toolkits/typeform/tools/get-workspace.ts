// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformGetWorkspace = tool({
  description:
    'Gets one workspace by ID — name, owning account, shared flag, and the count/link of typeforms it holds. Needs the workspaces:read scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    workspaceId: z.string().min(1).describe('Workspace ID'),
  }),
  execute: async ({ typeformToken, workspaceId }) => {
    if (!workspaceId) return { error: 'workspaceId is required.' };

    const result = await typeformRequest(
      typeformToken,
      `/workspaces/${encodeURIComponent(workspaceId)}`,
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
