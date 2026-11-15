// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest } from './client.js';

export const mistralListConversations = tool({
  description:
    'Lists Mistral conversations with their id, name, agent/model binding, and timestamps. Filter by metadata; page with page/pageSize (0-indexed).',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    page: z.number().min(0).optional().describe('Page number, 0-indexed (default 0)'),
    pageSize: z.number().min(1).optional().describe('Items per page (default 100)'),
    metadata: z.record(z.unknown()).optional().describe('Filter by metadata key/values'),
  }),
  execute: async ({ mistralToken, page, pageSize, metadata }) => {
    const result = await mistralRequest(mistralToken, '/conversations', {
      query: { page, page_size: pageSize, metadata },
    });
    if (result.error) return result;

    const data = result.data ?? {};
    if (Array.isArray(data)) return { object: 'list', data };
    return {
      object: data.object ?? 'list',
      data: Array.isArray(data.data) ? data.data : [],
      total: data.total,
    };
  },
});
