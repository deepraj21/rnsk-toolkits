// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxRpc } from './client.js';

export const dropboxLeaveSharedFolder = tool({
  description:
    'Relinquishes the connected account’s membership in a shared folder — the folder disappears from Dropbox. Set leaveACopy=true to keep a copy of the contents. This cannot be undone; re-sharing would need a new invitation.',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
    sharedFolderId: z
      .string()
      .min(1)
      .describe('Shared folder id to leave (from listSharedFolders)'),
    leaveACopy: z
      .boolean()
      .optional()
      .describe('Keep a copy of the folder in the account’s own Dropbox (default false)'),
  }),
  execute: async ({ dropboxToken, sharedFolderId, leaveACopy }) => {
    if (!sharedFolderId) return { error: 'sharedFolderId is required.' };

    const result = await dropboxRpc(dropboxToken, '/sharing/relinquish_folder_membership', {
      shared_folder_id: sharedFolderId,
      leave_a_copy: leaveACopy ?? false,
    });
    if (result.error) return result;

    return { left: true, sharedFolderId, result: result.data };
  },
});
