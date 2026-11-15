// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxRpc } from './client.js';

export const dropboxListFolderMembers = tool({
  description:
    'Lists the members of a shared folder and their access levels. Provide the shared_folder_id from listSharedFolders (a folder path also works). Pass the cursor from a previous response for the next page.',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
    sharedFolderId: z.string().min(1).describe('Shared folder id from listSharedFolders'),
    path: z
      .string()
      .optional()
      .describe('Alternatively identify the folder by path (folder id is extracted from it)'),
    cursor: z.string().optional().describe('Cursor from a previous response for the next page'),
  }),
  execute: async ({ dropboxToken, sharedFolderId, path, cursor }) => {
    if (!sharedFolderId && !path) return { error: 'sharedFolderId or path is required.' };

    const result = cursor
      ? await dropboxRpc(dropboxToken, '/sharing/list_folder_members/continue', { cursor })
      : await dropboxRpc(dropboxToken, '/sharing/list_folder_members', {
          shared_folder_id: sharedFolderId,
          path,
        });
    if (result.error) return result;

    const data = result.data ?? {};
    return {
      members: Array.isArray(data.members) ? data.members : [],
      cursor: data.cursor,
      refresh: data.refresh,
    };
  },
});
