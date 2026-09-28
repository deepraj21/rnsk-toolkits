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

export const listProjects = tool({
  description: 'List projects in an organization. Projects group workspaces for access scoping.',
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
        `/organizations/${encodeURIComponent(organization)}/projects`,
        {
          query: pageParams(pageNumber, pageSize),
        },
      );
      if (!result.ok) return failedResult('Failed to list Terraform projects', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error listing Terraform projects');
    }
  },
});

export const getProject = tool({
  description: 'Get a project by ID with workspace/team counts and permissions.',
  inputSchema: z.object({
    terraformToken: tokenField,
    projectId: z.string().describe('Project ID, e.g. "prj-xxxxxxxxxxxx"'),
  }),
  execute: async ({ terraformToken, projectId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/projects/${encodeURIComponent(projectId)}`,
      );
      if (!result.ok) return failedResult(`Failed to get Terraform project "${projectId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error getting Terraform project "${projectId}"`);
    }
  },
});

export const createProject = tool({
  description: 'Create a project in an organization to group workspaces.',
  inputSchema: z.object({
    terraformToken: tokenField,
    organization: orgField,
    name: z.string().describe('Project name, e.g. "Production"'),
    description: z.string().optional().describe('Project description'),
  }),
  execute: async ({ terraformToken, organization, name, description }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/organizations/${encodeURIComponent(organization)}/projects`,
        {
          method: 'POST',
          body: { data: { type: 'projects', attributes: { name, description } } },
        },
      );
      if (!result.ok) return failedResult('Failed to create Terraform project', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error creating Terraform project');
    }
  },
});

export const updateProject = tool({
  description: 'Update a project name or description.',
  inputSchema: z.object({
    terraformToken: tokenField,
    projectId: z.string().describe('Project ID to update'),
    name: z.string().optional().describe('New project name'),
    description: z.string().optional().describe('New project description'),
  }),
  execute: async ({ terraformToken, projectId, name, description }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/projects/${encodeURIComponent(projectId)}`,
        {
          method: 'PATCH',
          body: { data: { type: 'projects', attributes: { name, description } } },
        },
      );
      if (!result.ok)
        return failedResult(`Failed to update Terraform project "${projectId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error updating Terraform project "${projectId}"`);
    }
  },
});

export const deleteProject = tool({
  description: 'Delete an empty project. Projects containing workspaces cannot be deleted.',
  inputSchema: z.object({
    terraformToken: tokenField,
    projectId: z.string().describe('Project ID to delete'),
  }),
  execute: async ({ terraformToken, projectId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/projects/${encodeURIComponent(projectId)}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok)
        return failedResult(`Failed to delete Terraform project "${projectId}"`, result);
      return { success: true, projectId, statusCode: result.status };
    } catch (error) {
      return toTerraformError(error, `Error deleting Terraform project "${projectId}"`);
    }
  },
});
