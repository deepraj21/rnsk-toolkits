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

const accessAttributes = z
  .record(z.any())
  .describe(
    'Access level, e.g. {"access":"admin"} or custom {"runs":"apply","variables":"write","state-versions":"read-outputs","sentinel-mocks":"read","workspace-locking":true}.',
  );

export const listTeamAccess = tool({
  description: 'List team-to-workspace access grants, filterable by team or workspace.',
  inputSchema: z.object({
    terraformToken: tokenField,
    teamId: z.string().optional().describe('Filter by team ID'),
    workspaceId: z.string().optional().describe('Filter by workspace ID'),
    pageNumber: z.number().int().min(1).optional().describe('Page number (default 1)'),
    pageSize: z.number().int().min(1).max(100).optional().describe('Results per page (default 20)'),
  }),
  execute: async ({ terraformToken, teamId, workspaceId, pageNumber, pageSize }) => {
    try {
      const result = await terraformRequest(terraformToken, '/team-workspaces', {
        query: {
          'filter[team][id]': teamId,
          'filter[workspace][id]': workspaceId,
          ...pageParams(pageNumber, pageSize),
        },
      });
      if (!result.ok) return failedResult('Failed to list Terraform team access grants', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error listing Terraform team access grants');
    }
  },
});

export const getTeamAccess = tool({
  description: 'Get one team access grant by ID.',
  inputSchema: z.object({
    terraformToken: tokenField,
    teamAccessId: z.string().describe('Team access ID, e.g. "tws-xxxxxxxxxxxx"'),
  }),
  execute: async ({ terraformToken, teamAccessId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/team-workspaces/${encodeURIComponent(teamAccessId)}`,
      );
      if (!result.ok)
        return failedResult(`Failed to get Terraform team access "${teamAccessId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error getting Terraform team access "${teamAccessId}"`);
    }
  },
});

export const createTeamAccess = tool({
  description:
    'Grant a team access to a workspace (fixed permission set or custom run/variable/state permissions).',
  inputSchema: z.object({
    terraformToken: tokenField,
    teamId: z.string().describe('Team ID to grant access to'),
    workspaceId: z.string().describe('Workspace ID to grant access on'),
    access: accessAttributes,
  }),
  execute: async ({ terraformToken, teamId, workspaceId, access }) => {
    try {
      const result = await terraformRequest(terraformToken, '/team-workspaces', {
        method: 'POST',
        body: {
          data: {
            type: 'team-workspaces',
            attributes: access,
            relationships: {
              team: { data: { type: 'teams', id: teamId } },
              workspace: { data: { type: 'workspaces', id: workspaceId } },
            },
          },
        },
      });
      if (!result.ok) return failedResult('Failed to create Terraform team access grant', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error creating Terraform team access grant');
    }
  },
});

export const updateTeamAccess = tool({
  description: 'Change the permission level of a team access grant.',
  inputSchema: z.object({
    terraformToken: tokenField,
    teamAccessId: z.string().describe('Team access ID to update'),
    access: accessAttributes,
  }),
  execute: async ({ terraformToken, teamAccessId, access }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/team-workspaces/${encodeURIComponent(teamAccessId)}`,
        {
          method: 'PATCH',
          body: { data: { type: 'team-workspaces', attributes: access } },
        },
      );
      if (!result.ok)
        return failedResult(`Failed to update Terraform team access "${teamAccessId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error updating Terraform team access "${teamAccessId}"`);
    }
  },
});

export const deleteTeamAccess = tool({
  description: 'Revoke a team access grant from a workspace.',
  inputSchema: z.object({
    terraformToken: tokenField,
    teamAccessId: z.string().describe('Team access ID to delete'),
  }),
  execute: async ({ terraformToken, teamAccessId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/team-workspaces/${encodeURIComponent(teamAccessId)}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok)
        return failedResult(`Failed to delete Terraform team access "${teamAccessId}"`, result);
      return { success: true, teamAccessId, statusCode: result.status };
    } catch (error) {
      return toTerraformError(error, `Error deleting Terraform team access "${teamAccessId}"`);
    }
  },
});
