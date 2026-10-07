// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { makeRequest, failedResult, toMakeError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Make credentials JSON with baseUrl (zone URL, e.g. https://eu1.make.com) and apiToken',
  );
const orgIdField = z.number().int().describe('Organization ID from List Organizations');

export const makeCreateOrganization = tool({
  description:
    'Create a new Make organization with region, timezone, and country settings. Resolve IDs first via the enum tools (IMT regions, timezones, countries).',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    name: z.string().describe('Organization name'),
    regionId: z.number().int().describe('Make region instance ID (see Get IMT Regions)'),
    timezoneId: z.number().int().describe('Timezone ID (see List Timezones)'),
    countryId: z.number().int().describe('Country ID (see List Countries)'),
  }),
  execute: async ({ makeCredentials, name, regionId, timezoneId, countryId }) => {
    try {
      const result = await makeRequest(makeCredentials, '/organizations', {
        method: 'POST',
        body: { name, regionId, timezoneId, countryId },
      });
      if (!result.ok) return failedResult('Failed to create organization', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error creating organization');
    }
  },
});

export const makeGetOrganization = tool({
  description: 'Retrieve detailed information about one Make organization by ID.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    organizationId: orgIdField,
    wait: z
      .boolean()
      .optional()
      .describe('Wait for synchronization when reading immediately after creation'),
  }),
  execute: async ({ makeCredentials, organizationId, wait }) => {
    try {
      const result = await makeRequest(makeCredentials, `/organizations/${organizationId}`, {
        query: { wait },
      });
      if (!result.ok) return failedResult('Failed to get organization', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error getting organization');
    }
  },
});

export const makeListOrganizations = tool({
  description: 'List Make organizations with optional zone filter and pagination.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    zone: z.string().optional().describe('Filter by Make instance zone URL'),
    externalId: z.string().optional().describe('Filter by external identifier'),
    cols: z.array(z.string()).optional().describe('Organization fields to include'),
    pgLimit: z.number().int().min(1).optional().describe('Maximum records to return'),
    pgOffset: z.number().int().min(0).optional().describe('Records to skip'),
    pgSortBy: z.string().optional().describe('Field to sort by'),
    pgSortDir: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
  }),
  execute: async ({
    makeCredentials,
    zone,
    externalId,
    cols,
    pgLimit,
    pgOffset,
    pgSortBy,
    pgSortDir,
  }) => {
    try {
      const result = await makeRequest(makeCredentials, '/organizations', {
        query: {
          zone,
          externalId,
          'cols[]': cols,
          'pg[limit]': pgLimit,
          'pg[offset]': pgOffset,
          'pg[sortBy]': pgSortBy,
          'pg[sortDir]': pgSortDir,
        },
      });
      if (!result.ok) return failedResult('Failed to list organizations', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error listing organizations');
    }
  },
});

export const makeGetOperations = tool({
  description:
    'Retrieve daily operations usage (operations, data transfer bytes, centicredits) for a Make organization over the past 30 days. Use List Organizations first to get the organization ID.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    organizationId: orgIdField,
    organizationTimezone: z
      .boolean()
      .optional()
      .describe(
        'Use the organization timezone for day boundaries instead of the API caller timezone',
      ),
  }),
  execute: async ({ makeCredentials, organizationId, organizationTimezone }) => {
    try {
      const result = await makeRequest(makeCredentials, `/organizations/${organizationId}/usage`, {
        query: { organizationTimezone },
      });
      if (!result.ok) return failedResult('Failed to get operations usage', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error getting operations usage');
    }
  },
});

export const makeGetTeam = tool({
  description:
    'Retrieve detailed information about a Make team by ID, including member counts, resource usage, and license details.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    teamId: z.number().int().describe('Team ID from List Teams'),
  }),
  execute: async ({ makeCredentials, teamId }) => {
    try {
      const result = await makeRequest(makeCredentials, `/teams/${teamId}`);
      if (!result.ok) return failedResult('Failed to get team', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error getting team');
    }
  },
});

export const makeListTeams = tool({
  description: 'List Make teams in an organization with optional columns and pagination.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    organizationId: orgIdField,
    cols: z.array(z.string()).optional().describe('Team fields to include'),
    pgOffset: z.number().int().min(0).optional().describe('Records to skip'),
    pgSortBy: z.string().optional().describe('Field to sort by'),
  }),
  execute: async ({ makeCredentials, organizationId, cols, pgOffset, pgSortBy }) => {
    try {
      const result = await makeRequest(makeCredentials, '/teams', {
        query: {
          organizationId,
          'cols[]': cols,
          'pg[offset]': pgOffset,
          'pg[sortBy]': pgSortBy,
        },
      });
      if (!result.ok) return failedResult('Failed to list teams', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error listing teams');
    }
  },
});
