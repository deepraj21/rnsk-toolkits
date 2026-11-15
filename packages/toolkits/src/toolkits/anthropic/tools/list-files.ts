// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { anthropicRequest } from './client.js';

export const anthropicListFiles = tool({
  description:
    'Lists the files you have uploaded to the Anthropic Files API, newest first, with cursor pagination. Returns each file’s id, filename, MIME type, size, and whether it is downloadable.',
  inputSchema: z.object({
    anthropicApiKey: z.string().optional().describe('Anthropic API key (injected by system)'),
    page: z.string().optional().describe('Cursor from a previous response’s next_page'),
    limit: z.number().min(1).max(1000).optional().describe('Items per page (1-1000, default 20)'),
  }),
  execute: async ({ anthropicApiKey, page, limit }) => {
    const result = await anthropicRequest(anthropicApiKey, '/v1/files', {
      query: { page, limit },
    });
    if (result.error) return result;

    const data = Array.isArray(result.data?.data) ? result.data.data : result.data;

    return {
      files: (Array.isArray(data) ? data : []).map((file) => ({
        id: file.id,
        type: file.type,
        filename: file.filename,
        mime_type: file.mime_type,
        size_bytes: file.size_bytes,
        created_at: file.created_at,
        downloadable: file.downloadable,
        purpose: file.purpose,
      })),
      hasMore: Boolean(result.data?.has_more),
      nextPage: result.data?.next_page,
    };
  },
});
