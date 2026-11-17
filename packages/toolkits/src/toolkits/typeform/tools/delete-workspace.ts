// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformDeleteWorkspace = tool({
  description:
    'Deletes a workspace. The forms inside it are not deleted but may become harder to find — confirm with the user first. Needs the workspaces:write scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    workspaceId: z.string().min(1).describe('Workspace ID to delete'),
  }),
  execute: async ({ typeformToken, workspaceId }) => {
    if (!workspaceId) return { error: 'workspaceId is required.' };

    const result = await typeformRequest(
      typeformToken,
      `/workspaces/${encodeURIComponent(workspaceId)}`,
      { method: 'DELETE' },
    );
    if (result.error) return result;

    return { deleted: true, status: result.status, data: result.data ?? null };
  },
});
