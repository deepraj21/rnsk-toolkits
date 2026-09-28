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

export const listVariableSets = tool({
  description: 'List variable sets in an organization for sharing variables across workspaces.',
  inputSchema: z.object({
    terraformToken: tokenField,
    organization: orgField,
    pageNumber: z.number().int().min(1).optional().describe('Page number (default 1)'),
    pageSize: z.number().int().min(1).max(100).optional().describe('Results per page (default 20)'),
  }),
  execute: async ({ terraformToken, organization, pageNumber, pageSize }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/organizations/${encodeURIComponent(organization)}/varsets`,
        {
          query: pageParams(pageNumber, pageSize),
        },
      );
      if (!result.ok) return failedResult('Failed to list Terraform variable sets', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error listing Terraform variable sets');
    }
  },
});

export const getVariableSet = tool({
  description: 'Get a variable set by ID with scope and project/workspace attachments.',
  inputSchema: z.object({
    terraformToken: tokenField,
    variableSetId: z.string().describe('Variable set ID, e.g. "varset-xxxxxxxxxxxx"'),
    include: z.string().optional().describe('Related resources, e.g. "vars,workspaces"'),
  }),
  execute: async ({ terraformToken, variableSetId, include }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/varsets/${encodeURIComponent(variableSetId)}`,
        {
          query: { include },
        },
      );
      if (!result.ok)
        return failedResult(`Failed to get Terraform variable set "${variableSetId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error getting Terraform variable set "${variableSetId}"`);
    }
  },
});

export const createVariableSet = tool({
  description: 'Create a variable set scoped globally, to projects, or to specific workspaces.',
  inputSchema: z.object({
    terraformToken: tokenField,
    organization: orgField,
    name: z.string().describe('Variable set name, e.g. "AWS credentials"'),
    description: z.string().optional().describe('Variable set description'),
    global: z.boolean().optional().describe('Apply to all workspaces (default false)'),
    priority: z
      .boolean()
      .optional()
      .describe('Prioritize values over workspace variables (default false)'),
    projectIds: z.array(z.string()).optional().describe('Project IDs to scope the set to'),
    workspaceIds: z.array(z.string()).optional().describe('Workspace IDs to attach the set to'),
    variables: z
      .array(
        z.object({
          key: z.string(),
          value: z.string().optional(),
          category: z.enum(['terraform', 'env']),
          description: z.string().optional(),
          hcl: z.boolean().optional(),
          sensitive: z.boolean().optional(),
        }),
      )
      .optional()
      .describe('Variables to create in the set'),
  }),
  execute: async ({
    terraformToken,
    organization,
    name,
    description,
    global,
    priority,
    projectIds,
    workspaceIds,
    variables,
  }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/organizations/${encodeURIComponent(organization)}/varsets`,
        {
          method: 'POST',
          body: {
            data: {
              type: 'varsets',
              attributes: { name, description, global, priority },
              relationships: {
                ...(projectIds?.length
                  ? { projects: { data: projectIds.map((id) => ({ type: 'projects', id })) } }
                  : {}),
                ...(workspaceIds?.length
                  ? { workspaces: { data: workspaceIds.map((id) => ({ type: 'workspaces', id })) } }
                  : {}),
                ...(variables?.length
                  ? {
                      vars: {
                        data: variables.map((v) => ({
                          type: 'vars',
                          attributes: {
                            key: v.key,
                            value: v.value ?? '',
                            category: v.category,
                            description: v.description,
                            hcl: v.hcl ?? false,
                            sensitive: v.sensitive ?? false,
                          },
                        })),
                      },
                    }
                  : {}),
              },
            },
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create Terraform variable set', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error creating Terraform variable set');
    }
  },
});

export const updateVariableSet = tool({
  description:
    'Update a variable set name, description, scope, or priority (PUT replaces the resource).',
  inputSchema: z.object({
    terraformToken: tokenField,
    variableSetId: z.string().describe('Variable set ID to update'),
    name: z.string().optional().describe('New name'),
    description: z.string().optional().describe('New description'),
    global: z.boolean().optional().describe('Apply to all workspaces'),
    priority: z.boolean().optional().describe('Prioritize values over workspace variables'),
  }),
  execute: async ({ terraformToken, variableSetId, name, description, global, priority }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/varsets/${encodeURIComponent(variableSetId)}`,
        {
          method: 'PUT',
          body: { data: { type: 'varsets', attributes: { name, description, global, priority } } },
        },
      );
      if (!result.ok)
        return failedResult(`Failed to update Terraform variable set "${variableSetId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error updating Terraform variable set "${variableSetId}"`);
    }
  },
});

export const deleteVariableSet = tool({
  description: 'Delete a variable set and its variables.',
  inputSchema: z.object({
    terraformToken: tokenField,
    variableSetId: z.string().describe('Variable set ID to delete'),
  }),
  execute: async ({ terraformToken, variableSetId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/varsets/${encodeURIComponent(variableSetId)}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok)
        return failedResult(`Failed to delete Terraform variable set "${variableSetId}"`, result);
      return { success: true, variableSetId, statusCode: result.status };
    } catch (error) {
      return toTerraformError(error, `Error deleting Terraform variable set "${variableSetId}"`);
    }
  },
});

export const listVariableSetVars = tool({
  description: 'List variables inside a variable set (values hidden when sensitive).',
  inputSchema: z.object({
    terraformToken: tokenField,
    variableSetId: z.string().describe('Variable set ID'),
  }),
  execute: async ({ terraformToken, variableSetId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/varsets/${encodeURIComponent(variableSetId)}/relationships/vars`,
      );
      if (!result.ok)
        return failedResult('Failed to list Terraform variable set variables', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error listing Terraform variable set variables');
    }
  },
});

export const attachVariableSetWorkspaces = tool({
  description: 'Attach a variable set to workspaces.',
  inputSchema: z.object({
    terraformToken: tokenField,
    variableSetId: z.string().describe('Variable set ID'),
    workspaceIds: z.array(z.string()).min(1).describe('Workspace IDs to attach'),
  }),
  execute: async ({ terraformToken, variableSetId, workspaceIds }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/varsets/${encodeURIComponent(variableSetId)}/relationships/workspaces`,
        {
          method: 'POST',
          body: { data: workspaceIds.map((id) => ({ type: 'workspaces', id })) },
        },
      );
      if (!result.ok)
        return failedResult('Failed to attach Terraform variable set to workspaces', result);
      return result.data ?? { success: true, statusCode: result.status };
    } catch (error) {
      return toTerraformError(error, 'Error attaching Terraform variable set to workspaces');
    }
  },
});

export const detachVariableSetWorkspaces = tool({
  description: 'Detach a variable set from workspaces.',
  inputSchema: z.object({
    terraformToken: tokenField,
    variableSetId: z.string().describe('Variable set ID'),
    workspaceIds: z.array(z.string()).min(1).describe('Workspace IDs to detach'),
  }),
  execute: async ({ terraformToken, variableSetId, workspaceIds }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/varsets/${encodeURIComponent(variableSetId)}/relationships/workspaces`,
        {
          method: 'DELETE',
          body: { data: workspaceIds.map((id) => ({ type: 'workspaces', id })) },
        },
      );
      if (!result.ok)
        return failedResult('Failed to detach Terraform variable set from workspaces', result);
      return { success: true, variableSetId, statusCode: result.status };
    } catch (error) {
      return toTerraformError(error, 'Error detaching Terraform variable set from workspaces');
    }
  },
});
