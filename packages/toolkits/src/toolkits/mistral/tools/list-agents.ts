// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest } from './client.js';

export const mistralListAgents = tool({
  description:
    'Lists Mistral agents with their id, name, model, and version. Filter by name substring, free-text search, source (api/playground/agent_builder_v1), deployment state, or metadata; page with page/pageSize (0-indexed).',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    page: z.number().min(0).optional().describe('Page number, 0-indexed (default 0)'),
    pageSize: z.number().min(1).max(1000).optional().describe('Items per page (1-1000)'),
    name: z.string().optional().describe('Filter by exact agent name'),
    search: z.string().optional().describe('Free-text search over agents'),
    id: z.string().optional().describe('Filter by exact agent id'),
    deploymentChat: z.boolean().optional().describe('Filter by chat-deployment state'),
    sources: z
      .array(z.enum(['api', 'playground', 'agent_builder_v1']))
      .optional()
      .describe('Filter by where the agent was created'),
    metadata: z.record(z.unknown()).optional().describe('Filter by metadata key/values'),
  }),
  execute: async ({
    mistralToken,
    page,
    pageSize,
    name,
    search,
    id,
    deploymentChat,
    sources,
    metadata,
  }) => {
    const result = await mistralRequest(mistralToken, '/agents', {
      query: {
        page,
        page_size: pageSize,
        name,
        search,
        id,
        deployment_chat: deploymentChat,
        sources,
        metadata,
      },
    });
    if (result.error) return result;

    const data = result.data ?? {};
    // The collection may come back as { object, data, next_page_token } or a bare array.
    if (Array.isArray(data)) return { object: 'list', data };
    return {
      object: data.object ?? 'list',
      data: Array.isArray(data.data) ? data.data : [],
      nextPageToken: data.next_page_token,
    };
  },
});
