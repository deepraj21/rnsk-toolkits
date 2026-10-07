// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { workdayRest, failedResult, toWorkdayError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Workday credentials JSON with baseUrl, tenant, and OAuth client (clientId/clientSecret/refreshToken) or accessToken',
  );
const idField = z.string().describe('Workday ID (WID)');
const pagingFields = {
  limit: z.number().int().min(1).max(100).optional().describe('Results per page'),
  offset: z.number().int().min(0).optional().describe('Results to skip'),
};
const STAFFING = 'staffing/v1';

export const workdayListPositions = tool({
  description: 'List staffing positions in the tenant.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    ...pagingFields,
  }),
  execute: async ({ workdayCredentials, limit, offset }) => {
    try {
      const result = await workdayRest(workdayCredentials, STAFFING, '/positions', {
        query: { limit, offset },
      });
      if (!result.ok) return failedResult('Failed to list positions', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error listing positions');
    }
  },
});

export const workdayGetPosition = tool({
  description: 'Get a single position by Workday ID.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    id: idField,
  }),
  execute: async ({ workdayCredentials, id }) => {
    try {
      const result = await workdayRest(workdayCredentials, STAFFING, `/positions/${id}`);
      if (!result.ok) return failedResult('Failed to get position', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error getting position');
    }
  },
});

export const workdayListJobProfiles = tool({
  description: 'List job profiles (job catalog) in the tenant.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    ...pagingFields,
  }),
  execute: async ({ workdayCredentials, limit, offset }) => {
    try {
      const result = await workdayRest(workdayCredentials, STAFFING, '/jobProfiles', {
        query: { limit, offset },
      });
      if (!result.ok) return failedResult('Failed to list job profiles', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error listing job profiles');
    }
  },
});

export const workdayGetJobProfile = tool({
  description: 'Get a single job profile by Workday ID.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    id: idField,
  }),
  execute: async ({ workdayCredentials, id }) => {
    try {
      const result = await workdayRest(workdayCredentials, STAFFING, `/jobProfiles/${id}`);
      if (!result.ok) return failedResult('Failed to get job profile', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error getting job profile');
    }
  },
});
