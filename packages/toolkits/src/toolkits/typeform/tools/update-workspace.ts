// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformUpdateWorkspace = tool({
  description:
    'Updates a workspace with operations — rename it ({ op: "replace", path: "/name", value: "..." }) or add/remove members ({ op: "add", path: "/members", value: { email, role } }). Send the ops as a JSON array. Needs the workspaces:write scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    workspaceId: z.string().min(1).describe('Workspace ID to update'),
    operations: z
      .array(z.record(z.any()))
      .min(1)
      .describe(
        'Operations array, e.g. [{ op: "replace", path: "/name", value: "Marketing workspace" }] or [{ op: "add", path: "/members", value: { email: "a@b.com", role: "owner" } }]',
      ),
  }),
  execute: async ({ typeformToken, workspaceId, operations }) => {
    if (!workspaceId) return { error: 'workspaceId is required.' };
    if (!operations || !operations.length)
      return { error: 'operations is required (at least one op).' };

    const result = await typeformRequest(
      typeformToken,
      `/workspaces/${encodeURIComponent(workspaceId)}`,
      { method: 'PATCH', body: operations },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
