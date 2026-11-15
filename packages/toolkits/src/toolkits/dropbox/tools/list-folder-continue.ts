// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxRpc } from './client.js';

export const dropboxListFolderContinue = tool({
  description:
    'Fetches the next page of a Dropbox folder listing using the cursor returned by dropboxListFolder (or a previous call to this tool). Returns more entries plus the next cursor while hasMore is true.',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
    cursor: z
      .string()
      .min(1)
      .describe('Cursor from the previous listFolder / listFolderContinue response'),
  }),
  execute: async ({ dropboxToken, cursor }) => {
    if (!cursor) return { error: 'cursor is required.' };

    const result = await dropboxRpc(dropboxToken, '/files/list_folder/continue', { cursor });
    if (result.error) return result;

    const data = result.data ?? {};
    return {
      entries: Array.isArray(data.entries) ? data.entries : [],
      cursor: data.cursor,
      hasMore: data.has_more ?? false,
    };
  },
});
