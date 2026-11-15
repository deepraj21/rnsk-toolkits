// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { anthropicRequest } from './client.js';

export const anthropicListSkills = tool({
  description:
    'Lists the Claude Skills in your workspace with cursor pagination, including each skill’s display name, version, status, and timestamps.',
  inputSchema: z.object({
    anthropicApiKey: z.string().optional().describe('Anthropic API key (injected by system)'),
    page: z.string().optional().describe('Cursor from a previous response’s next_page'),
    limit: z.number().min(1).max(1000).optional().describe('Items per page (1-1000, default 20)'),
  }),
  execute: async ({ anthropicApiKey, page, limit }) => {
    const result = await anthropicRequest(anthropicApiKey, '/v1/skills', {
      query: { page, limit },
    });
    if (result.error) return result;

    const data = Array.isArray(result.data?.data) ? result.data.data : result.data;

    return {
      skills: (Array.isArray(data) ? data : []).map((skill) => ({
        id: skill.id,
        type: skill.type,
        display_name: skill.display_name,
        version: skill.version,
        created_at: skill.created_at,
        updated_at: skill.updated_at,
        status: skill.status,
      })),
      hasMore: Boolean(result.data?.has_more),
      nextPage: result.data?.next_page,
    };
  },
});
