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
const CORE = 'v1';

export const workdayListOrganizations = tool({
  description: 'List organizations (company, cost center, region, etc.) with search.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    search: z.string().optional().describe('Search string to filter organizations'),
    ...pagingFields,
  }),
  execute: async ({ workdayCredentials, search, limit, offset }) => {
    try {
      const result = await workdayRest(workdayCredentials, CORE, '/organizations', {
        query: { search, limit, offset },
      });
      if (!result.ok) return failedResult('Failed to list organizations', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error listing organizations');
    }
  },
});

export const workdayGetOrganization = tool({
  description: 'Get a single organization by Workday ID.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    id: idField,
  }),
  execute: async ({ workdayCredentials, id }) => {
    try {
      const result = await workdayRest(workdayCredentials, CORE, `/organizations/${id}`);
      if (!result.ok) return failedResult('Failed to get organization', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error getting organization');
    }
  },
});

export const workdayListSupervisoryOrganizations = tool({
  description: 'List supervisory organizations (management chains) with search.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    search: z.string().optional().describe('Search string'),
    ...pagingFields,
  }),
  execute: async ({ workdayCredentials, search, limit, offset }) => {
    try {
      const result = await workdayRest(workdayCredentials, CORE, '/supervisoryOrganizations', {
        query: { search, limit, offset },
      });
      if (!result.ok) return failedResult('Failed to list supervisory organizations', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error listing supervisory organizations');
    }
  },
});

export const workdayGetSupervisoryOrganization = tool({
  description: 'Get a supervisory organization with manager and staffing model.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    id: idField,
  }),
  execute: async ({ workdayCredentials, id }) => {
    try {
      const result = await workdayRest(workdayCredentials, CORE, `/supervisoryOrganizations/${id}`);
      if (!result.ok) return failedResult('Failed to get supervisory organization', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error getting supervisory organization');
    }
  },
});

export const workdayListSupervisoryOrgWorkers = tool({
  description: 'List workers assigned to a supervisory organization.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    id: idField,
    ...pagingFields,
  }),
  execute: async ({ workdayCredentials, id, limit, offset }) => {
    try {
      const result = await workdayRest(
        workdayCredentials,
        CORE,
        `/supervisoryOrganizations/${id}/workers`,
        {
          query: { limit, offset },
        },
      );
      if (!result.ok)
        return failedResult('Failed to list supervisory organization workers', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error listing supervisory organization workers');
    }
  },
});

export const workdayListOrganizationTypes = tool({
  description: 'List organization types available in the tenant.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    ...pagingFields,
  }),
  execute: async ({ workdayCredentials, limit, offset }) => {
    try {
      const result = await workdayRest(workdayCredentials, CORE, '/organizationTypes', {
        query: { limit, offset },
      });
      if (!result.ok) return failedResult('Failed to list organization types', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error listing organization types');
    }
  },
});
