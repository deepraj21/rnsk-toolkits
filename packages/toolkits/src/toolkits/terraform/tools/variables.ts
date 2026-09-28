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

export const listVariables = tool({
  description: 'List variables for a workspace (or all readable workspaces when unfiltered).',
  inputSchema: z.object({
    terraformToken: tokenField,
    organization: z
      .string()
      .optional()
      .describe('Organization name filter (requires workspace name too)'),
    workspaceName: z
      .string()
      .optional()
      .describe('Workspace name filter (requires organization too)'),
    pageNumber: z.number().int().min(1).optional().describe('Page number (default 1)'),
    pageSize: z.number().int().min(1).max(100).optional().describe('Results per page (default 20)'),
  }),
  execute: async ({ terraformToken, organization, workspaceName, pageNumber, pageSize }) => {
    try {
      const result = await terraformRequest(terraformToken, '/vars', {
        query: {
          'filter[organization][name]': organization,
          'filter[workspace][name]': workspaceName,
          ...pageParams(pageNumber, pageSize),
        },
      });
      if (!result.ok) return failedResult('Failed to list Terraform variables', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error listing Terraform variables');
    }
  },
});

export const createVariable = tool({
  description: 'Create a Terraform or environment variable on a workspace.',
  inputSchema: z.object({
    terraformToken: tokenField,
    workspaceId: z.string().describe('Workspace ID owning the variable'),
    key: z.string().describe('Variable name, e.g. "instance_type" or "AWS_SECRET_ACCESS_KEY"'),
    value: z.string().optional().describe('Variable value (write-once if sensitive)'),
    category: z.enum(['terraform', 'env']).describe('Variable category'),
    description: z.string().optional().describe('Variable description'),
    hcl: z.boolean().optional().describe('Evaluate value as HCL (terraform category only)'),
    sensitive: z.boolean().optional().describe('Mark sensitive (value hidden after write)'),
  }),
  execute: async ({
    terraformToken,
    workspaceId,
    key,
    value,
    category,
    description,
    hcl,
    sensitive,
  }) => {
    try {
      const result = await terraformRequest(terraformToken, '/vars', {
        method: 'POST',
        body: {
          data: {
            type: 'vars',
            attributes: {
              key,
              value: value ?? '',
              description,
              category,
              hcl: hcl ?? false,
              sensitive: sensitive ?? false,
            },
            relationships: { workspace: { data: { id: workspaceId, type: 'workspaces' } } },
          },
        },
      });
      if (!result.ok) return failedResult('Failed to create Terraform variable', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error creating Terraform variable');
    }
  },
});

export const getVariable = tool({
  description: 'Get a variable by ID (sensitive values are never returned).',
  inputSchema: z.object({
    terraformToken: tokenField,
    variableId: z.string().describe('Variable ID, e.g. "var-xxxxxxxxxxxx"'),
  }),
  execute: async ({ terraformToken, variableId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/vars/${encodeURIComponent(variableId)}`,
      );
      if (!result.ok)
        return failedResult(`Failed to get Terraform variable "${variableId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error getting Terraform variable "${variableId}"`);
    }
  },
});

export const updateVariable = tool({
  description:
    'Update a variable key, value, description, category, or flags. Omitted fields stay unchanged.',
  inputSchema: z.object({
    terraformToken: tokenField,
    variableId: z.string().describe('Variable ID to update'),
    key: z.string().optional().describe('New variable name'),
    value: z.string().optional().describe('New value'),
    description: z.string().optional().describe('New description'),
    category: z.enum(['terraform', 'env']).optional().describe('New category'),
    hcl: z.boolean().optional().describe('Evaluate value as HCL'),
    sensitive: z.boolean().optional().describe('Mark sensitive'),
  }),
  execute: async ({
    terraformToken,
    variableId,
    key,
    value,
    description,
    category,
    hcl,
    sensitive,
  }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/vars/${encodeURIComponent(variableId)}`,
        {
          method: 'PATCH',
          body: {
            data: {
              id: variableId,
              type: 'vars',
              attributes: { key, value, description, category, hcl, sensitive },
            },
          },
        },
      );
      if (!result.ok)
        return failedResult(`Failed to update Terraform variable "${variableId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error updating Terraform variable "${variableId}"`);
    }
  },
});

export const deleteVariable = tool({
  description: 'Delete a variable from a workspace.',
  inputSchema: z.object({
    terraformToken: tokenField,
    variableId: z.string().describe('Variable ID to delete'),
  }),
  execute: async ({ terraformToken, variableId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/vars/${encodeURIComponent(variableId)}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok)
        return failedResult(`Failed to delete Terraform variable "${variableId}"`, result);
      return { success: true, variableId, statusCode: result.status };
    } catch (error) {
      return toTerraformError(error, `Error deleting Terraform variable "${variableId}"`);
    }
  },
});
