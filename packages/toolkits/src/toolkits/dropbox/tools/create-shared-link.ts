// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxRpc } from './client.js';

export const dropboxCreateSharedLink = tool({
  description:
    'Creates a shared link for a Dropbox file or folder and returns its URL and settings. Optional settings control access level (viewer/editor/max), expiry, and download permission. If the path already has a link, this errors with shared_link_already_exists — call dropboxListSharedLinks to fetch the existing one instead.',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
    path: z.string().min(1).describe('File or folder path to share'),
    access: z
      .enum(['viewer', 'editor', 'max'])
      .optional()
      .describe('Who the link grants access to (settings-dependent; often "viewer")'),
    allowDownload: z.boolean().optional().describe('Allow link visitors to download the file'),
    expires: z
      .string()
      .optional()
      .describe('Expiry timestamp, ISO 8601, e.g. "2026-12-31T23:59:59Z"'),
    requirePassword: z.boolean().optional().describe('Require a password to open the link'),
    linkPassword: z.string().optional().describe('The password when requirePassword is set'),
  }),
  execute: async ({
    dropboxToken,
    path,
    access,
    allowDownload,
    expires,
    requirePassword,
    linkPassword,
  }) => {
    if (!path) return { error: 'path is required.' };

    const settings = {
      access,
      allow_download: allowDownload,
      expires,
      require_password: requirePassword,
      link_password: linkPassword,
    };
    const result = await dropboxRpc(dropboxToken, '/sharing/create_shared_link_with_settings', {
      path,
      settings: Object.values(settings).some((v) => v !== undefined) ? settings : undefined,
    });
    if (result.error) {
      if (String(result.error).includes('shared_link_already_exists')) {
        return {
          error: `${result.error} — a shared link already exists for this path; use dropboxListSharedLinks to retrieve it.`,
        };
      }
      return result;
    }

    return result.data;
  },
});
