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
const orgField = z.string().describe('Organization name, e.g. "my-organization"');

export const listOrganizations = tool({
  description: 'List HCP Terraform organizations visible to the token.',
  inputSchema: z.object({
    terraformToken: tokenField,
    pageNumber: z.number().int().min(1).optional().describe('Page number (default 1)'),
    pageSize: z.number().int().min(1).max(100).optional().describe('Results per page (default 20)'),
  }),
  execute: async ({ terraformToken, pageNumber, pageSize }) => {
    try {
      const result = await terraformRequest(terraformToken, '/organizations', {
        query: pageParams(pageNumber, pageSize),
      });
      if (!result.ok) return failedResult('Failed to list Terraform organizations', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error listing Terraform organizations');
    }
  },
});

export const getOrganization = tool({
  description: 'Get an organization with permissions, plan, and feature flags.',
  inputSchema: z.object({
    terraformToken: tokenField,
    organization: orgField,
  }),
  execute: async ({ terraformToken, organization }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/organizations/${encodeURIComponent(organization)}`,
      );
      if (!result.ok)
        return failedResult(`Failed to get Terraform organization "${organization}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error getting Terraform organization "${organization}"`);
    }
  },
});

export const createOrganization = tool({
  description: 'Create a new HCP Terraform organization with an owner email.',
  inputSchema: z.object({
    terraformToken: tokenField,
    name: z.string().describe('Organization name (lowercase letters, numbers, dashes)'),
    email: z.string().describe('Admin/owner email for the organization'),
  }),
  execute: async ({ terraformToken, name, email }) => {
    try {
      const result = await terraformRequest(terraformToken, '/organizations', {
        method: 'POST',
        body: { data: { type: 'organizations', attributes: { name, email } } },
      });
      if (!result.ok) return failedResult('Failed to create Terraform organization', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error creating Terraform organization');
    }
  },
});

export const updateOrganization = tool({
  description:
    'Update organization settings such as name, email, session timeout, or execution mode defaults.',
  inputSchema: z.object({
    terraformToken: tokenField,
    organization: orgField,
    attributes: z
      .record(z.any())
      .describe(
        'Attributes to update, e.g. {"name":"new-name","email":"ops@example.com","default-execution-mode":"remote"}',
      ),
  }),
  execute: async ({ terraformToken, organization, attributes }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/organizations/${encodeURIComponent(organization)}`,
        {
          method: 'PATCH',
          body: { data: { type: 'organizations', attributes } },
        },
      );
      if (!result.ok)
        return failedResult(`Failed to update Terraform organization "${organization}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error updating Terraform organization "${organization}"`);
    }
  },
});

export const deleteOrganization = tool({
  description: 'Permanently delete an organization and everything in it. This cannot be undone.',
  inputSchema: z.object({
    terraformToken: tokenField,
    organization: orgField,
  }),
  execute: async ({ terraformToken, organization }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/organizations/${encodeURIComponent(organization)}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok)
        return failedResult(`Failed to delete Terraform organization "${organization}"`, result);
      return { success: true, organization, statusCode: result.status };
    } catch (error) {
      return toTerraformError(error, `Error deleting Terraform organization "${organization}"`);
    }
  },
});

export const getOrganizationEntitlements = tool({
  description:
    'Get organization feature entitlements (agents, SSO, Sentinel, cost estimation, teams, limits).',
  inputSchema: z.object({
    terraformToken: tokenField,
    organization: orgField,
  }),
  execute: async ({ terraformToken, organization }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/organizations/${encodeURIComponent(organization)}/entitlement-set`,
      );
      if (!result.ok)
        return failedResult('Failed to get Terraform organization entitlements', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error getting Terraform organization entitlements');
    }
  },
});
