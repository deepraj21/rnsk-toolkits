// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxRpc } from './client.js';

export const dropboxRemoveFolderMember = tool({
  description:
    'Removes a member from a shared Dropbox folder (by email or Dropbox id). Returns an async job id — poll with dropboxCheckRemoveMemberStatus to confirm the removal completed.',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
    sharedFolderId: z.string().min(1).describe('Shared folder id to remove the member from'),
    memberEmail: z.string().optional().describe('Member’s email address'),
    memberDropboxId: z.string().optional().describe('Member’s Dropbox account id (dbid:...)'),
    leaveACopy: z
      .boolean()
      .optional()
      .describe('Keep a copy of the shared folder in the member’s Dropbox (default false)'),
  }),
  execute: async ({ dropboxToken, sharedFolderId, memberEmail, memberDropboxId, leaveACopy }) => {
    if (!sharedFolderId) return { error: 'sharedFolderId is required.' };
    if (!memberEmail && !memberDropboxId) {
      return { error: 'memberEmail or memberDropboxId is required.' };
    }

    const member = memberDropboxId ? { dropbox_id: memberDropboxId } : { email: memberEmail };
    const result = await dropboxRpc(dropboxToken, '/sharing/remove_folder_member', {
      shared_folder_id: sharedFolderId,
      member,
      leave_a_copy: leaveACopy ?? false,
    });
    if (result.error) return result;

    const data = result.data ?? {};
    if (data.async_job_id) {
      return {
        status: 'in_progress',
        asyncJobId: data.async_job_id,
        note: 'Removal is running. Poll with dropboxCheckRemoveMemberStatus using this asyncJobId.',
      };
    }
    return { status: 'complete', result: data };
  },
});
