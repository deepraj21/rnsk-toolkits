// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxRpc } from './client.js';

export const dropboxGetSharedFolderMetadata = tool({
  description:
    'Gets metadata for one shared folder by shared_folder_id: name, path, owner, your access level, and the folder’s member/policy settings.',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
    sharedFolderId: z.string().min(1).describe('Shared folder id from listSharedFolders'),
  }),
  execute: async ({ dropboxToken, sharedFolderId }) => {
    if (!sharedFolderId) return { error: 'sharedFolderId is required.' };

    const result = await dropboxRpc(dropboxToken, '/sharing/get_folder_metadata', {
      shared_folder_id: sharedFolderId,
    });
    if (result.error) return result;

    return result.data;
  },
});
