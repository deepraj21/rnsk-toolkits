// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { greenhouseRequest } from './client.js';

export const greenhouseGetJob = tool({
  description:
    'Gets one Greenhouse job by id (title, status, department, offices, requisition id, timestamps). Harvest v3 has no single-job GET, so this uses the jobs list with an ids filter.',
  inputSchema: z.object({
    greenhouseCredentials: z
      .string()
      .optional()
      .describe('Greenhouse Harvest API credentials "clientId:clientSecret" (injected by system)'),
    jobId: z.number().describe('Greenhouse job id'),
  }),
  execute: async ({ greenhouseCredentials, jobId }) => {
    const result = await greenhouseRequest(greenhouseCredentials, '/jobs', {
      query: { ids: String(jobId) },
    });

    if (result.error) return result;

    const jobs = Array.isArray(result.data) ? result.data : [];
    if (!jobs.length) {
      return {
        error: `No job found with id ${jobId}. It may be deleted or outside your permissions.`,
      };
    }
    return jobs[0];
  },
});
