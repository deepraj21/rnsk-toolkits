// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxRpc } from './client.js';

export const dropboxRevokeSharedLink = tool({
  description:
    'Revokes (disables) a Dropbox shared link immediately — anyone using the link loses access. Provide the link URL from dropboxListSharedLinks or dropboxCreateSharedLink.',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
    url: z.string().min(1).describe('The shared link URL to revoke'),
  }),
  execute: async ({ dropboxToken, url }) => {
    if (!url) return { error: 'url is required.' };

    const result = await dropboxRpc(dropboxToken, '/sharing/revoke_shared_link', { url });
    if (result.error) return result;

    return { revoked: true, url };
  },
});
