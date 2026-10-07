// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pulumiRequest, failedResult, toPulumiError } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const orgField = z.string().describe('Organization name');

export const pulumiGetOrg = tool({
  description: 'Get a Pulumi Cloud organization (plan, billing, and settings summary).',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
  }),
  execute: async ({ pulumiAccessToken, orgName }) => {
    try {
      const result = await pulumiRequest(pulumiAccessToken, `/api/orgs/${orgName}`);
      if (!result.ok) return failedResult('Failed to get organization', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error getting organization');
    }
  },
});

export const pulumiGetOrgMetadata = tool({
  description: 'Get organization metadata (default project, VCS defaults, feature flags).',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
  }),
  execute: async ({ pulumiAccessToken, orgName }) => {
    try {
      const result = await pulumiRequest(pulumiAccessToken, `/api/orgs/${orgName}/metadata`);
      if (!result.ok) return failedResult('Failed to get organization metadata', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error getting organization metadata');
    }
  },
});

export const pulumiListOrgTeams = tool({
  description: 'List teams in a Pulumi Cloud organization.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
  }),
  execute: async ({ pulumiAccessToken, orgName }) => {
    try {
      const result = await pulumiRequest(pulumiAccessToken, `/api/orgs/${orgName}/teams`);
      if (!result.ok) return failedResult('Failed to list organization teams', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error listing organization teams');
    }
  },
});

export const pulumiListOrgMembers = tool({
  description: 'List members of a Pulumi Cloud organization.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
  }),
  execute: async ({ pulumiAccessToken, orgName }) => {
    try {
      const result = await pulumiRequest(pulumiAccessToken, `/api/orgs/${orgName}/members`);
      if (!result.ok) return failedResult('Failed to list organization members', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error listing organization members');
    }
  },
});

export const pulumiProjectExists = tool({
  description: 'Check whether a project exists in an organization (lightweight HEAD check).',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: z.string().describe('Project name'),
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        `/api/stacks/${orgName}/${projectName}`,
        { method: 'HEAD' },
      );
      if (!result.ok) return failedResult('Project does not exist or is not accessible', result);
      return { exists: true, projectName: result.data ?? projectName };
    } catch (error) {
      return toPulumiError(error, 'Error checking project');
    }
  },
});
