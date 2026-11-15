// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxRpc } from './client.js';

export const dropboxMoveFile = tool({
  description:
    'Moves or renames a Dropbox file or folder (from_path → to_path) and returns the updated metadata. Folders move with all their contents. Use autorename to resolve destination conflicts.',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
    fromPath: z.string().min(1).describe('Current path of the file/folder'),
    toPath: z.string().min(1).describe('Destination path, including the new name'),
    autorename: z.boolean().optional().describe('Auto-rename on conflict (default false)'),
    allowOwnFileMove: z
      .boolean()
      .optional()
      .describe('Allow moving a file the account already owns (default false)'),
  }),
  execute: async ({ dropboxToken, fromPath, toPath, autorename, allowOwnFileMove }) => {
    if (!fromPath) return { error: 'fromPath is required.' };
    if (!toPath) return { error: 'toPath is required.' };

    const result = await dropboxRpc(dropboxToken, '/files/move_v2', {
      from_path: fromPath,
      to_path: toPath,
      autorename,
      allow_own_file_move: allowOwnFileMove,
    });
    if (result.error) return result;

    const data = result.data ?? {};
    return data.metadata ?? data;
  },
});
