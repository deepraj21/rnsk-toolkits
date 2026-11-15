// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxRpc } from './client.js';

export const dropboxListSharedLinks = tool({
  description:
    'Lists the shared links for a Dropbox file or folder (or the whole account when path is omitted), with each link’s URL, visibility, password/expiry settings, and download permission. Pass the cursor from a previous response for the next page.',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
    path: z
      .string()
      .optional()
      .describe('Restrict to links for this path (omit for all links in the account)'),
    directOnly: z
      .boolean()
      .optional()
      .describe('Only links created directly on the path, not parent-folder links'),
    cursor: z.string().optional().describe('Cursor from a previous response for the next page'),
  }),
  execute: async ({ dropboxToken, path, directOnly, cursor }) => {
    const result = await dropboxRpc(dropboxToken, '/sharing/list_shared_links', {
      path,
      direct_only: directOnly,
      cursor,
    });
    if (result.error) return result;

    const data = result.data ?? {};
    return {
      links: Array.isArray(data.links) ? data.links : [],
      hasMore: data.has_more ?? false,
      cursor: data.cursor,
    };
  },
});
