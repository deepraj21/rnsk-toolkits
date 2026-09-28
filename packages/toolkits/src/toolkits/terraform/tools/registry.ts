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

export const listRegistryModules = tool({
  description: 'List private registry modules with versions and verification status.',
  inputSchema: z.object({
    terraformToken: tokenField,
    organization: orgField,
    searchQuery: z.string().optional().describe('Search modules by name (search[q])'),
    pageNumber: z.number().int().min(1).optional().describe('Page number (default 1)'),
    pageSize: z.number().int().min(1).max(100).optional().describe('Results per page (default 20)'),
  }),
  execute: async ({ terraformToken, organization, searchQuery, pageNumber, pageSize }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/organizations/${encodeURIComponent(organization)}/registry-modules`,
        {
          query: { 'search[q]': searchQuery, ...pageParams(pageNumber, pageSize) },
        },
      );
      if (!result.ok) return failedResult('Failed to list Terraform registry modules', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error listing Terraform registry modules');
    }
  },
});

export const getRegistryModule = tool({
  description: 'Get a registry module with versions, root inputs/outputs, and VCS repo.',
  inputSchema: z.object({
    terraformToken: tokenField,
    organization: orgField,
    namespace: z.string().describe('Module namespace, usually the organization name'),
    name: z.string().describe('Module name, e.g. "vpc"'),
    provider: z.string().describe('Provider, e.g. "aws"'),
  }),
  execute: async ({ terraformToken, organization, namespace, name, provider }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/organizations/${encodeURIComponent(organization)}/registry-modules/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}/${encodeURIComponent(provider)}`,
      );
      if (!result.ok)
        return failedResult(
          `Failed to get Terraform registry module "${namespace}/${name}/${provider}"`,
          result,
        );
      return result.data;
    } catch (error) {
      return toTerraformError(
        error,
        `Error getting Terraform registry module "${namespace}/${name}/${provider}"`,
      );
    }
  },
});

export const deleteRegistryModuleVersion = tool({
  description: 'Delete one version of a private registry module.',
  inputSchema: z.object({
    terraformToken: tokenField,
    organization: orgField,
    namespace: z.string().describe('Module namespace'),
    name: z.string().describe('Module name'),
    provider: z.string().describe('Provider'),
    version: z.string().describe('Version to delete, e.g. "1.2.0"'),
  }),
  execute: async ({ terraformToken, organization, namespace, name, provider, version }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/organizations/${encodeURIComponent(organization)}/registry-modules/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}/${encodeURIComponent(provider)}/${encodeURIComponent(version)}`,
        { method: 'DELETE' },
      );
      if (!result.ok)
        return failedResult('Failed to delete Terraform registry module version', result);
      return { success: true, statusCode: result.status };
    } catch (error) {
      return toTerraformError(error, 'Error deleting Terraform registry module version');
    }
  },
});
