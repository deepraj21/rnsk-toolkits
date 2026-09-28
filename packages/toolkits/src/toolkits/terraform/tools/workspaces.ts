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
const wsIdField = z.string().describe('Workspace ID, e.g. "ws-xxxxxxxxxxxx"');

export const listWorkspaces = tool({
  description:
    'List workspaces in an organization with lock state, run status, and resource counts.',
  inputSchema: z.object({
    terraformToken: tokenField,
    organization: orgField,
    searchName: z.string().optional().describe('Filter by workspace name substring (search[name])'),
    pageNumber: z.number().int().min(1).optional().describe('Page number (default 1)'),
    pageSize: z.number().int().min(1).max(100).optional().describe('Results per page (default 20)'),
  }),
  execute: async ({ terraformToken, organization, searchName, pageNumber, pageSize }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/organizations/${encodeURIComponent(organization)}/workspaces`,
        {
          query: { 'search[name]': searchName, ...pageParams(pageNumber, pageSize) },
        },
      );
      if (!result.ok) return failedResult('Failed to list Terraform workspaces', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error listing Terraform workspaces');
    }
  },
});

export const getWorkspace = tool({
  description: 'Get a workspace by ID with settings, permissions, current run, and state info.',
  inputSchema: z.object({
    terraformToken: tokenField,
    workspaceId: wsIdField,
  }),
  execute: async ({ terraformToken, workspaceId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/workspaces/${encodeURIComponent(workspaceId)}`,
      );
      if (!result.ok)
        return failedResult(`Failed to get Terraform workspace "${workspaceId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error getting Terraform workspace "${workspaceId}"`);
    }
  },
});

export const getWorkspaceByName = tool({
  description: 'Get a workspace by organization and name (human-friendly lookup).',
  inputSchema: z.object({
    terraformToken: tokenField,
    organization: orgField,
    workspaceName: z.string().describe('Workspace name, e.g. "prod-network"'),
  }),
  execute: async ({ terraformToken, organization, workspaceName }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/organizations/${encodeURIComponent(organization)}/workspaces/${encodeURIComponent(workspaceName)}`,
      );
      if (!result.ok)
        return failedResult(`Failed to get Terraform workspace "${workspaceName}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error getting Terraform workspace "${workspaceName}"`);
    }
  },
});

export const createWorkspace = tool({
  description:
    'Create a workspace with execution settings. Assign a projectId to scope it to a project.',
  inputSchema: z.object({
    terraformToken: tokenField,
    organization: orgField,
    name: z.string().describe('Workspace name (letters, numbers, -, _)'),
    attributes: z
      .record(z.any())
      .optional()
      .describe(
        'Extra settings, e.g. {"description":"...","auto-apply":false,"execution-mode":"remote","terraform-version":"1.9.0","working-directory":"envs/prod","trigger-prefixes":["modules/"]}',
      ),
    projectId: z
      .string()
      .optional()
      .describe('Project ID to place the workspace in (defaults to Default Project)'),
  }),
  execute: async ({ terraformToken, organization, name, attributes, projectId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/organizations/${encodeURIComponent(organization)}/workspaces`,
        {
          method: 'POST',
          body: {
            data: {
              type: 'workspaces',
              attributes: { name, ...(attributes ?? {}) },
              ...(projectId
                ? { relationships: { project: { data: { type: 'projects', id: projectId } } } }
                : {}),
            },
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create Terraform workspace', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error creating Terraform workspace');
    }
  },
});

export const updateWorkspace = tool({
  description:
    'Update workspace settings such as name, description, auto-apply, execution mode, or Terraform version.',
  inputSchema: z.object({
    terraformToken: tokenField,
    workspaceId: wsIdField,
    attributes: z
      .record(z.any())
      .describe(
        'Attributes to update, e.g. {"auto-apply":true,"terraform-version":"1.10.0","working-directory":"envs/prod"}',
      ),
  }),
  execute: async ({ terraformToken, workspaceId, attributes }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/workspaces/${encodeURIComponent(workspaceId)}`,
        {
          method: 'PATCH',
          body: { data: { type: 'workspaces', attributes } },
        },
      );
      if (!result.ok)
        return failedResult(`Failed to update Terraform workspace "${workspaceId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error updating Terraform workspace "${workspaceId}"`);
    }
  },
});

export const deleteWorkspace = tool({
  description:
    'Delete a workspace and its runs, state, and variables. Locked workspaces must be unlocked first.',
  inputSchema: z.object({
    terraformToken: tokenField,
    workspaceId: wsIdField,
  }),
  execute: async ({ terraformToken, workspaceId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/workspaces/${encodeURIComponent(workspaceId)}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok)
        return failedResult(`Failed to delete Terraform workspace "${workspaceId}"`, result);
      return { success: true, workspaceId, statusCode: result.status };
    } catch (error) {
      return toTerraformError(error, `Error deleting Terraform workspace "${workspaceId}"`);
    }
  },
});

export const safeDeleteWorkspace = tool({
  description:
    'Safely delete a workspace only if it has no managed resources (refuses when resources exist).',
  inputSchema: z.object({
    terraformToken: tokenField,
    workspaceId: wsIdField,
  }),
  execute: async ({ terraformToken, workspaceId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/workspaces/${encodeURIComponent(workspaceId)}/actions/safe-delete`,
        {
          method: 'POST',
        },
      );
      if (!result.ok)
        return failedResult(`Failed to safely delete Terraform workspace "${workspaceId}"`, result);
      return { success: true, workspaceId, statusCode: result.status };
    } catch (error) {
      return toTerraformError(error, `Error safely deleting Terraform workspace "${workspaceId}"`);
    }
  },
});

export const lockWorkspace = tool({
  description: 'Lock a workspace to prevent new runs, with an explanatory reason shown in the UI.',
  inputSchema: z.object({
    terraformToken: tokenField,
    workspaceId: wsIdField,
    reason: z.string().optional().describe('Lock reason, e.g. "Investigating failed apply"'),
  }),
  execute: async ({ terraformToken, workspaceId, reason }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/workspaces/${encodeURIComponent(workspaceId)}/actions/lock`,
        {
          method: 'POST',
          body: reason !== undefined ? { reason } : {},
        },
      );
      if (!result.ok)
        return failedResult(`Failed to lock Terraform workspace "${workspaceId}"`, result);
      return result.data ?? { success: true, workspaceId, statusCode: result.status };
    } catch (error) {
      return toTerraformError(error, `Error locking Terraform workspace "${workspaceId}"`);
    }
  },
});

export const unlockWorkspace = tool({
  description: 'Unlock a workspace so runs can be queued again.',
  inputSchema: z.object({
    terraformToken: tokenField,
    workspaceId: wsIdField,
  }),
  execute: async ({ terraformToken, workspaceId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/workspaces/${encodeURIComponent(workspaceId)}/actions/unlock`,
        {
          method: 'POST',
        },
      );
      if (!result.ok)
        return failedResult(`Failed to unlock Terraform workspace "${workspaceId}"`, result);
      return result.data ?? { success: true, workspaceId, statusCode: result.status };
    } catch (error) {
      return toTerraformError(error, `Error unlocking Terraform workspace "${workspaceId}"`);
    }
  },
});

export const forceUnlockWorkspace = tool({
  description: 'Force-unlock a workspace stuck locked by a crashed run. Use with caution.',
  inputSchema: z.object({
    terraformToken: tokenField,
    workspaceId: wsIdField,
  }),
  execute: async ({ terraformToken, workspaceId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/workspaces/${encodeURIComponent(workspaceId)}/actions/force-unlock`,
        {
          method: 'POST',
        },
      );
      if (!result.ok)
        return failedResult(`Failed to force-unlock Terraform workspace "${workspaceId}"`, result);
      return result.data ?? { success: true, workspaceId, statusCode: result.status };
    } catch (error) {
      return toTerraformError(error, `Error force-unlocking Terraform workspace "${workspaceId}"`);
    }
  },
});

export const listWorkspaceRuns = tool({
  description:
    'List runs in a workspace with status/operation filters. Plan-only runs are excluded by default.',
  inputSchema: z.object({
    terraformToken: tokenField,
    workspaceId: wsIdField,
    status: z
      .string()
      .optional()
      .describe('Comma-separated statuses, e.g. "planned,applied,errored"'),
    operation: z
      .string()
      .optional()
      .describe('Comma-separated operations, e.g. "plan_only,plan_and_apply,destroy"'),
    statusGroup: z
      .enum(['non_final', 'final', 'discardable'])
      .optional()
      .describe('Status group filter'),
    searchCommit: z.string().optional().describe('Filter by commit SHA'),
    pageNumber: z.number().int().min(1).optional().describe('Page number (default 1)'),
    pageSize: z.number().int().min(1).max(100).optional().describe('Results per page (default 20)'),
  }),
  execute: async ({
    terraformToken,
    workspaceId,
    status,
    operation,
    statusGroup,
    searchCommit,
    pageNumber,
    pageSize,
  }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/workspaces/${encodeURIComponent(workspaceId)}/runs`,
        {
          query: {
            'filter[status]': status,
            'filter[operation]': operation,
            'filter[status_group]': statusGroup,
            'search[commit]': searchCommit,
            ...pageParams(pageNumber, pageSize),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to list Terraform workspace runs', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error listing Terraform workspace runs');
    }
  },
});
