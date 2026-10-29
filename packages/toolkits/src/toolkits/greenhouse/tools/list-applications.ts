// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { greenhouseRequest } from './client.js';

export const greenhouseListApplications = tool({
  description:
    'Lists Greenhouse applications (a candidate on a specific job) with cursor pagination. Filter by application ids, candidate ids, job ids, status (in_process/rejected/hired/converted), stage name, or prospect flag. Follow nextCursor for more pages.',
  inputSchema: z.object({
    greenhouseCredentials: z
      .string()
      .optional()
      .describe('Greenhouse Harvest API credentials "clientId:clientSecret" (injected by system)'),
    ids: z.string().optional().describe('Comma-separated application ids to fetch (max 50)'),
    candidateIds: z
      .string()
      .optional()
      .describe('Comma-separated candidate ids (max 50) — only their applications'),
    jobIds: z
      .string()
      .optional()
      .describe('Comma-separated job ids (max 50) — only applications on these jobs'),
    status: z
      .enum(['in_process', 'rejected', 'hired', 'converted'])
      .optional()
      .describe('Filter by application lifecycle status'),
    stageName: z
      .string()
      .optional()
      .describe('Filter by current stage name (exact, case sensitive), e.g. "Phone Screen"'),
    prospect: z
      .boolean()
      .optional()
      .describe('true = only prospect applications, false = only job applications'),
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
    candidateIds,
    jobIds,
    status,
    stageName,
    prospect,
    perPage,
    cursor,
  }) => {
    const result = await greenhouseRequest(greenhouseCredentials, '/applications', {
      query: {
        cursor,
        ids,
        candidate_ids: candidateIds,
        job_ids: jobIds,
        status,
        stage_name: stageName,
        prospect,
        per_page: perPage,
      },
    });

    if (result.error) return result;

    const applications = Array.isArray(result.data) ? result.data : [];
    return {
      applications,
      count: applications.length,
      nextCursor: result.nextCursor ?? undefined,
    };
  },
});
