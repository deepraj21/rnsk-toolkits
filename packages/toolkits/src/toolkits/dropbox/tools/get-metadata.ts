// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxRpc } from './client.js';

export const dropboxGetMetadata = tool({
  description:
    'Gets metadata for a Dropbox file or folder by path (or file id like "id:abc123..."): name, size, content hash, rev, timestamps, and whether it is a file or folder. Returns a path/not_found error if nothing exists at the path.',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
    path: z
      .string()
      .min(1)
      .describe('File or folder path, or "id:..." file id, e.g. "/Reports/q3.pdf"'),
    includeMediaInfo: z
      .boolean()
      .optional()
      .describe('Include photo/video metadata (default false)'),
    includeDeleted: z
      .boolean()
      .optional()
      .describe('Return metadata for a deleted entry (default false)'),
    includeExplicitSharedMembers: z
      .boolean()
      .optional()
      .describe('Include explicit shared members on the entry (default false)'),
  }),
  execute: async ({
    dropboxToken,
    path,
    includeMediaInfo,
    includeDeleted,
    includeExplicitSharedMembers,
  }) => {
    if (!path) return { error: 'path is required.' };

    const result = await dropboxRpc(dropboxToken, '/files/get_metadata', {
      path,
      include_media_info: includeMediaInfo,
      include_deleted: includeDeleted,
      include_explicit_shared_members: includeExplicitSharedMembers,
    });
    if (result.error) return result;

    return result.data;
  },
});
