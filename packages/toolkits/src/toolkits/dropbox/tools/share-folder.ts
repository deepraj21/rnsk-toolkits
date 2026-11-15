// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxRpc } from './client.js';

export const dropboxShareFolder = tool({
  description:
    'Creates a shared folder from an existing Dropbox folder path and returns its shared_folder_id (or an async job id to poll with dropboxCheckShareFolderStatus). Optional policies control who can be a member and who can manage members. To invite people afterwards, use dropboxAddFolderMember.',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
    path: z.string().min(1).describe('Folder path to share, e.g. "/Projects/2026"'),
    memberPolicy: z
      .enum(['anyone', 'team'])
      .optional()
      .describe('Who can be added as a member (team policy applies on team accounts)'),
    aclUpdatePolicy: z
      .enum(['owner', 'editors'])
      .optional()
      .describe('Who can add/remove members (default: owner)'),
    forceAsync: z
      .boolean()
      .optional()
      .describe('Force the operation to run as an async job (default false)'),
  }),
  execute: async ({ dropboxToken, path, memberPolicy, aclUpdatePolicy, forceAsync }) => {
    if (!path) return { error: 'path is required.' };

    const result = await dropboxRpc(dropboxToken, '/sharing/share_folder', {
      path,
      member_policy: memberPolicy,
      acl_update_policy: aclUpdatePolicy,
      force_async: forceAsync,
    });
    if (result.error) return result;

    const data = result.data ?? {};
    if (data['.tag'] === 'async_job_id' || data.async_job_id) {
      return {
        status: 'in_progress',
        asyncJobId: data.async_job_id,
        note: 'Sharing is still running. Poll with dropboxCheckShareFolderStatus using this asyncJobId.',
      };
    }
    const folder = data['.tag'] === 'complete' && data.complete ? data.complete : data;
    return { status: 'complete', folder };
  },
});
