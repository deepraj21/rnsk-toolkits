// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxRpc } from './client.js';

export const dropboxAddFolderMember = tool({
  description:
    'Invites a member to a shared Dropbox folder by email or Dropbox id, granting an access level (editor, viewer, viewer_no_comment, or traverse). Optionally include a custom invitation message. The folder id comes from dropboxShareFolder / dropboxListSharedFolders.',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
    sharedFolderId: z.string().min(1).describe('Shared folder id to add the member to'),
    memberEmail: z.string().optional().describe('Invitee’s email address'),
    memberDropboxId: z
      .string()
      .optional()
      .describe('Existing member’s Dropbox account id (dbid:...)'),
    accessLevel: z
      .enum(['editor', 'viewer', 'viewer_no_comment', 'traverse'])
      .optional()
      .describe('Access to grant (default viewer)'),
    quiet: z.boolean().optional().describe('Do not send an email notification'),
    customMessage: z.string().min(1).optional().describe('Custom invitation message'),
  }),
  execute: async ({
    dropboxToken,
    sharedFolderId,
    memberEmail,
    memberDropboxId,
    accessLevel,
    quiet,
    customMessage,
  }) => {
    if (!sharedFolderId) return { error: 'sharedFolderId is required.' };
    if (!memberEmail && !memberDropboxId) {
      return { error: 'memberEmail or memberDropboxId is required.' };
    }

    const member = memberDropboxId ? { dropbox_id: memberDropboxId } : { email: memberEmail };
    const result = await dropboxRpc(dropboxToken, '/sharing/add_folder_member', {
      shared_folder_id: sharedFolderId,
      members: [{ member, access_level: accessLevel }],
      quiet,
      custom_message: customMessage,
    });
    if (result.error) return result;

    return { added: true, sharedFolderId, member, accessLevel: accessLevel ?? 'viewer' };
  },
});
