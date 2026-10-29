// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { greenhouseRequest } from './client.js';

export const greenhouseListJobs = tool({
  description:
    'Lists Greenhouse jobs (requisitions) with cursor pagination. Filter by status (open/draft/closed), ids, department, office, requisition id, or created/opened/closed date range. Follow nextCursor for more pages.',
  inputSchema: z.object({
    greenhouseCredentials: z
      .string()
      .optional()
      .describe('Greenhouse Harvest API credentials "clientId:clientSecret" (injected by system)'),
    ids: z
      .string()
      .optional()
      .describe('Comma-separated job ids to fetch (max 50), e.g. "1234,5678"'),
    status: z
      .enum(['open', 'draft', 'closed'])
      .optional()
      .describe('Filter by job lifecycle status'),
    departmentId: z.number().optional().describe('Filter by department id'),
    officeIds: z.string().optional().describe('Comma-separated office ids (max 50)'),
    requisitionId: z.string().optional().describe('Filter by requisition id'),
    createdAfter: z
      .string()
      .optional()
      .describe('Only jobs created at/after this ISO-8601 date-time, e.g. "2024-01-01T00:00:00Z"'),
    createdBefore: z
      .string()
      .optional()
      .describe('Only jobs created at/before this ISO-8601 date-time'),
    openedAfter: z
      .string()
      .optional()
      .describe('Only jobs opened at/after this ISO-8601 date-time'),
    openedBefore: z
      .string()
      .optional()
      .describe('Only jobs opened at/before this ISO-8601 date-time'),
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
    status,
    departmentId,
    officeIds,
    requisitionId,
    createdAfter,
    createdBefore,
    openedAfter,
    openedBefore,
    perPage,
    cursor,
  }) => {
    const dateRange = (after, before) =>
      [after ? `gte:${after}` : null, before ? `lte:${before}` : null].filter(Boolean).join('|') ||
      undefined;

    const result = await greenhouseRequest(greenhouseCredentials, '/jobs', {
      query: {
        cursor,
        ids,
        status,
        department_id: departmentId,
        office_ids: officeIds,
        requisition_id: requisitionId,
        created_at: dateRange(createdAfter, createdBefore),
        opened_at: dateRange(openedAfter, openedBefore),
        per_page: perPage,
      },
    });

    if (result.error) return result;

    const jobs = Array.isArray(result.data) ? result.data : [];
    return {
      jobs,
      count: jobs.length,
      nextCursor: result.nextCursor ?? undefined,
    };
  },
});
