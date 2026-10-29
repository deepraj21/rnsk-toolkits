// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { greenhouseRequest } from './client.js';

export const greenhouseListCandidates = tool({
  description:
    'Lists Greenhouse candidates with cursor pagination. Filter by ids, email address, tag, or created/updated/last-activity date range. Follow nextCursor for more pages.',
  inputSchema: z.object({
    greenhouseCredentials: z
      .string()
      .optional()
      .describe('Greenhouse Harvest API credentials "clientId:clientSecret" (injected by system)'),
    ids: z
      .string()
      .optional()
      .describe('Comma-separated candidate ids to fetch (max 50), e.g. "1234,5678"'),
    email: z
      .string()
      .optional()
      .describe('Only candidates with this email address on their profile'),
    tag: z.string().optional().describe('Filter by candidate tag name (exact match)'),
    private: z
      .boolean()
      .optional()
      .describe('Include private candidates (default true); set false to exclude them'),
    createdAfter: z
      .string()
      .optional()
      .describe('Only candidates created at/after this ISO-8601 date-time'),
    createdBefore: z
      .string()
      .optional()
      .describe('Only candidates created at/before this ISO-8601 date-time'),
    updatedAfter: z
      .string()
      .optional()
      .describe('Only candidates updated at/after this ISO-8601 date-time'),
    updatedBefore: z
      .string()
      .optional()
      .describe('Only candidates updated at/before this ISO-8601 date-time'),
    perPage: z
      .number()
      .min(1)
      .max(500)
      .optional()
      .describe('Results per page (1-500, default 100)'),
    cursor: z
      .string()
      .optional()
      .describe('Cursor from a previous page response (pass alone, without other filters)'),
  }),
  execute: async ({
    greenhouseCredentials,
    ids,
    email,
    tag,
    private: isPrivate,
    createdAfter,
    createdBefore,
    updatedAfter,
    updatedBefore,
    perPage,
    cursor,
  }) => {
    const dateRange = (after, before) =>
      [after ? `gte:${after}` : null, before ? `lte:${before}` : null].filter(Boolean).join('|') ||
      undefined;

    const result = await greenhouseRequest(greenhouseCredentials, '/candidates', {
      query: {
        cursor,
        ids,
        email,
        tag,
        private: isPrivate,
        created_at: dateRange(createdAfter, createdBefore),
        updated_at: dateRange(updatedAfter, updatedBefore),
        per_page: perPage,
      },
    });

    if (result.error) return result;

    const candidates = Array.isArray(result.data) ? result.data : [];
    return {
      candidates,
      count: candidates.length,
      nextCursor: result.nextCursor ?? undefined,
    };
  },
});
