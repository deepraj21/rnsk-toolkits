// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxRpc } from './client.js';

export const dropboxRestoreFile = tool({
  description:
    'Restores a Dropbox file to an earlier revision (from dropboxListFileRevisions) and returns the restored metadata. Use this to undo bad edits to a file that still exists at its path.',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
    path: z.string().min(1).describe('Path of the file to restore'),
    rev: z
      .string()
      .min(1)
      .describe('Revision to restore, e.g. "a1b2c3d4e5" (from listFileRevisions)'),
  }),
  execute: async ({ dropboxToken, path, rev }) => {
    if (!path) return { error: 'path is required.' };
    if (!rev) return { error: 'rev is required.' };

    const result = await dropboxRpc(dropboxToken, '/files/restore', { path, rev });
    if (result.error) return result;

    return result.data;
  },
});
