// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxRpc } from './client.js';

export const dropboxCreateFolder = tool({
  description:
    'Creates a folder in Dropbox at the given path and returns its metadata. Use autorename=true to avoid failing when a folder already exists there. Parent folders are created automatically if missing.',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
    path: z.string().min(1).describe('Folder path to create, e.g. "/Projects/2026"'),
    autorename: z
      .boolean()
      .optional()
      .describe('If the folder exists, auto-rename instead of failing (default false)'),
  }),
  execute: async ({ dropboxToken, path, autorename }) => {
    if (!path) return { error: 'path is required.' };

    const result = await dropboxRpc(dropboxToken, '/files/create_folder_v2', {
      path,
      autorename,
    });
    if (result.error) return result;

    const data = result.data ?? {};
    return data.metadata ?? data;
  },
});
