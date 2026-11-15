// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxRpc } from './client.js';

export const dropboxListSharedFolders = tool({
  description:
    'Lists the shared folders the connected Dropbox account has access to (mounted or owned), with each folder’s id, name, path, and your access level. Use the shared_folder_id with the other shared-folder tools. Pass the cursor from a previous response for the next page.',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
    limit: z
      .number()
      .min(1)
      .max(1000)
      .optional()
      .describe('Max folders per page (1-1000, default 1000)'),
    cursor: z.string().optional().describe('Cursor from a previous response for the next page'),
  }),
  execute: async ({ dropboxToken, limit, cursor }) => {
    const result = cursor
      ? await dropboxRpc(dropboxToken, '/sharing/list_folders/continue', { cursor })
      : await dropboxRpc(dropboxToken, '/sharing/list_folders', { limit });
    if (result.error) return result;

    const data = result.data ?? {};
    return {
      entries: Array.isArray(data.entries) ? data.entries : [],
      hasMore: data.has_more ?? false,
      cursor: data.cursor,
    };
  },
});
