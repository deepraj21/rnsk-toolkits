// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxRpc } from './client.js';

export const dropboxSearchFiles = tool({
  description:
    'Searches Dropbox for files and folders matching a query, returning flattened matches (name, path, id, tag). Scope to a folder with path, raise maxResults (up to 1000) for more, or pass the cursor from a previous response to fetch the next page. Supports filenameOnly and file extension filters.',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
    query: z.string().min(1).max(1000).describe('Search text, e.g. "quarterly report"'),
    path: z.string().optional().describe('Restrict the search to this folder path ("" = root)'),
    maxResults: z
      .number()
      .min(1)
      .max(1000)
      .optional()
      .describe('Max matches to return (1-1000, default 100)'),
    filenameOnly: z
      .boolean()
      .optional()
      .describe('Match only on file names, not full-text content'),
    fileStatus: z
      .enum(['active', 'deleted', 'all'])
      .optional()
      .describe('Which file statuses to include (default "active")'),
    fileExtensions: z
      .string()
      .optional()
      .describe('Comma-separated extension filter, e.g. "pdf,docx"'),
    cursor: z
      .string()
      .optional()
      .describe(
        'Cursor from a previous response — continues the search instead of starting a new one',
      ),
  }),
  execute: async ({
    dropboxToken,
    query,
    path,
    maxResults,
    filenameOnly,
    fileStatus,
    fileExtensions,
    cursor,
  }) => {
    const result = cursor
      ? await dropboxRpc(dropboxToken, '/files/search/continue_v2', { cursor })
      : await dropboxRpc(dropboxToken, '/files/search_v2', {
          query,
          options: {
            path,
            max_results: maxResults,
            filename_only: filenameOnly,
            file_status: fileStatus,
            file_extensions: fileExtensions
              ? fileExtensions
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              : undefined,
          },
        });
    if (result.error) return result;

    const data = result.data ?? {};
    const matches = Array.isArray(data.matches) ? data.matches : [];
    return {
      results: matches.map((m) => ({ matchType: m.match_type, ...(m.metadata ?? {}) })),
      hasMore: data.has_more ?? false,
      cursor: data.cursor,
    };
  },
});
