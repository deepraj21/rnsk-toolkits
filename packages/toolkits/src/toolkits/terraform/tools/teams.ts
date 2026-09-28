// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { failedResult, pageParams, terraformRequest, toTerraformError } from './client.js';

const tokenField = z
  .string()
  .optional()
  .describe(
    'Injected Terraform API token (user, team, or organization token) — match manifest tokenField',
  );
const orgField = z.string().describe('Organization name');

export const listTeams = tool({
  description: 'List teams in an organization with member counts.',
  inputSchema: z.object({
    terraformToken: tokenField,
    organization: orgField,
    query: z.string().optional().describe('Search teams by name (q)'),
    pageNumber: z.number().int().min(1).optional().describe('Page number (default 1)'),
    pageSize: z.number().int().min(1).max(100).optional().describe('Results per page (default 20)'),
  }),
  execute: async ({ terraformToken, organization, query, pageNumber, pageSize }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/organizations/${encodeURIComponent(organization)}/teams`,
        {
          query: { q: query, ...pageParams(pageNumber, pageSize) },
        },
      );
      if (!result.ok) return failedResult('Failed to list Terraform teams', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error listing Terraform teams');
    }
  },
});

export const getTeam = tool({
  description: 'Get a team by ID with organization permissions and member count.',
  inputSchema: z.object({
    terraformToken: tokenField,
    teamId: z.string().describe('Team ID, e.g. "team-xxxxxxxxxxxx"'),
  }),
  execute: async ({ terraformToken, teamId }) => {
    try {
      const result = await terraformRequest(terraformToken, `/teams/${encodeURIComponent(teamId)}`);
      if (!result.ok) return failedResult(`Failed to get Terraform team "${teamId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error getting Terraform team "${teamId}"`);
    }
  },
});

export const createTeam = tool({
  description:
    'Create a team with organization-level permissions (manage workspaces, projects, policies, VCS, etc.).',
  inputSchema: z.object({
    terraformToken: tokenField,
    organization: orgField,
    name: z.string().describe('Team name, e.g. "platform-admins"'),
    organizationAccess: z
      .record(z.any())
      .optional()
      .describe(
        'Org permissions, e.g. {"manage-workspaces":true,"manage-projects":true,"manage-policies":true}',
      ),
    visibility: z
      .enum(['secret', 'organization'])
      .optional()
      .describe('Team visibility (default secret)'),
  }),
  execute: async ({ terraformToken, organization, name, organizationAccess, visibility }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/organizations/${encodeURIComponent(organization)}/teams`,
        {
          method: 'POST',
          body: {
            data: {
              type: 'teams',
              attributes: { name, 'organization-access': organizationAccess, visibility },
            },
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create Terraform team', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error creating Terraform team');
    }
  },
});

export const updateTeam = tool({
  description: 'Update team name, visibility, or organization permissions.',
  inputSchema: z.object({
    terraformToken: tokenField,
    teamId: z.string().describe('Team ID to update'),
    name: z.string().optional().describe('New team name'),
    organizationAccess: z
      .record(z.any())
      .optional()
      .describe('Replacement organization permissions object'),
    visibility: z.enum(['secret', 'organization']).optional().describe('New visibility'),
  }),
  execute: async ({ terraformToken, teamId, name, organizationAccess, visibility }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/teams/${encodeURIComponent(teamId)}`,
        {
          method: 'PATCH',
          body: {
            data: {
              type: 'teams',
              attributes: { name, 'organization-access': organizationAccess, visibility },
            },
          },
        },
      );
      if (!result.ok) return failedResult(`Failed to update Terraform team "${teamId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error updating Terraform team "${teamId}"`);
    }
  },
});

export const deleteTeam = tool({
  description: 'Delete a team (workspace access granted through it is revoked).',
  inputSchema: z.object({
    terraformToken: tokenField,
    teamId: z.string().describe('Team ID to delete'),
  }),
  execute: async ({ terraformToken, teamId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/teams/${encodeURIComponent(teamId)}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok) return failedResult(`Failed to delete Terraform team "${teamId}"`, result);
      return { success: true, teamId, statusCode: result.status };
    } catch (error) {
      return toTerraformError(error, `Error deleting Terraform team "${teamId}"`);
    }
  },
});

export const listTeamTokens = tool({
  description:
    'List team API tokens in an organization (metadata only; secrets shown once at creation).',
  inputSchema: z.object({
    terraformToken: tokenField,
    organization: orgField,
    query: z.string().optional().describe('Search by team name (q)'),
    status: z
      .string()
      .optional()
      .describe(
        'Comma-separated statuses: active, expiring_in_7_days, expiring_in_30_days, expired, no_expiration',
      ),
    pageNumber: z.number().int().min(1).optional().describe('Page number (default 1)'),
    pageSize: z.number().int().min(1).max(100).optional().describe('Results per page (default 20)'),
  }),
  execute: async ({ terraformToken, organization, query, status, pageNumber, pageSize }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/organizations/${encodeURIComponent(organization)}/team-tokens`,
        {
          query: { q: query, 'filter[status]': status, ...pageParams(pageNumber, pageSize) },
        },
      );
      if (!result.ok) return failedResult('Failed to list Terraform team tokens', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error listing Terraform team tokens');
    }
  },
});

export const getTeamToken = tool({
  description: 'Get team token metadata by token ID (secret never returned).',
  inputSchema: z.object({
    terraformToken: tokenField,
    tokenId: z.string().describe('Token ID, e.g. "at-xxxxxxxxxxxx"'),
  }),
  execute: async ({ terraformToken, tokenId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/authentication-tokens/${encodeURIComponent(tokenId)}`,
      );
      if (!result.ok)
        return failedResult(`Failed to get Terraform team token "${tokenId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error getting Terraform team token "${tokenId}"`);
    }
  },
});

export const createTeamToken = tool({
  description: 'Generate a team API token. The secret is returned once — store it immediately.',
  inputSchema: z.object({
    terraformToken: tokenField,
    teamId: z.string().describe('Team ID to generate the token for'),
    description: z
      .string()
      .optional()
      .describe('Unique token description, e.g. "CI token for team ABC"'),
    expiredAt: z
      .string()
      .optional()
      .describe('Expiry ISO timestamp (default 2 years from creation)'),
  }),
  execute: async ({ terraformToken, teamId, description, expiredAt }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/teams/${encodeURIComponent(teamId)}/authentication-tokens`,
        {
          method: 'POST',
          body: {
            data: {
              type: 'authentication-tokens',
              attributes: { description, 'expired-at': expiredAt },
            },
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create Terraform team token', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error creating Terraform team token');
    }
  },
});

export const deleteTeamToken = tool({
  description: 'Revoke a team API token by token ID.',
  inputSchema: z.object({
    terraformToken: tokenField,
    tokenId: z.string().describe('Token ID to revoke'),
  }),
  execute: async ({ terraformToken, tokenId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/authentication-tokens/${encodeURIComponent(tokenId)}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok)
        return failedResult(`Failed to delete Terraform team token "${tokenId}"`, result);
      return { success: true, tokenId, statusCode: result.status };
    } catch (error) {
      return toTerraformError(error, `Error deleting Terraform team token "${tokenId}"`);
    }
  },
});
