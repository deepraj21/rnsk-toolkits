// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxRpc } from './client.js';

export const dropboxListFolder = tool({
  description:
    'Lists the contents of a Dropbox folder, returning each file/folder’s metadata plus a cursor for the next page (pass it back as cursor). The root folder is the empty string "" — use "/Projects" style paths otherwise. Set recursive to flatten the whole subtree in one call.',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
    path: z
      .string()
      .optional()
      .describe('Folder path; "" (empty string) is the root, e.g. "/Projects"'),
    recursive: z
      .boolean()
      .optional()
      .describe('Include all subfolders recursively (default false)'),
    includeDeleted: z.boolean().optional().describe('Include deleted entries (default false)'),
    includeMediaInfo: z
      .boolean()
      .optional()
      .describe('Include photo/video metadata (default false)'),
    limit: z.number().min(1).max(2000).optional().describe('Max entries per page (1-2000)'),
    includeMountedFolders: z
      .boolean()
      .optional()
      .describe('Include entries under mounted shared folders (default true)'),
    includeNonDownloadableFiles: z
      .boolean()
      .optional()
      .describe('Include Google Docs–style non-downloadable files (default true)'),
  }),
  execute: async ({
    dropboxToken,
    path,
    recursive,
    includeDeleted,
    includeMediaInfo,
    limit,
    includeMountedFolders,
    includeNonDownloadableFiles,
  }) => {
    const result = await dropboxRpc(dropboxToken, '/files/list_folder', {
      path: path ?? '',
      recursive,
      include_deleted: includeDeleted,
      include_media_info: includeMediaInfo,
      limit,
      include_mounted_folders: includeMountedFolders,
      include_non_downloadable_files: includeNonDownloadableFiles,
    });
    if (result.error) return result;

    const data = result.data ?? {};
    return {
      entries: Array.isArray(data.entries) ? data.entries : [],
      cursor: data.cursor,
      hasMore: data.has_more ?? false,
    };
  },
});
