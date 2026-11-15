// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxRpc } from './client.js';

export const dropboxListFileRevisions = tool({
  description:
    'Lists the revisions of a Dropbox file (up to 100), newest first, with each revision’s rev, size, and timestamps. Use a returned rev with dropboxDownloadFile (rev) or dropboxRestoreFile to read or roll back to an older version.',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
    path: z.string().min(1).describe('File path or "id:..." file id'),
    limit: z.number().min(1).max(100).optional().describe('Max revisions (1-100, default 10)'),
    beforeRev: z.string().optional().describe('Only revisions older than this rev'),
    mode: z
      .enum(['path', 'id'])
      .optional()
      .describe('Interpret the identifier as a path (default) or a file id'),
  }),
  execute: async ({ dropboxToken, path, limit, beforeRev, mode }) => {
    if (!path) return { error: 'path is required.' };

    const result = await dropboxRpc(dropboxToken, '/files/list_revisions', {
      path,
      limit,
      before_rev: beforeRev,
      mode,
    });
    if (result.error) return result;

    const data = result.data ?? {};
    return { entries: Array.isArray(data.entries) ? data.entries : [], cursor: data.cursor };
  },
});
