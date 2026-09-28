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

export const listPolicies = tool({
  description: 'List Sentinel policies in an organization.',
  inputSchema: z.object({
    terraformToken: tokenField,
    organization: orgField,
    searchName: z.string().optional().describe('Filter by policy name substring (search[name])'),
    pageNumber: z.number().int().min(1).optional().describe('Page number (default 1)'),
    pageSize: z.number().int().min(1).max(100).optional().describe('Results per page (default 20)'),
  }),
  execute: async ({ terraformToken, organization, searchName, pageNumber, pageSize }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/organizations/${encodeURIComponent(organization)}/policies`,
        {
          query: { 'search[name]': searchName, ...pageParams(pageNumber, pageSize) },
        },
      );
      if (!result.ok) return failedResult('Failed to list Terraform policies', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error listing Terraform policies');
    }
  },
});

export const getPolicy = tool({
  description: 'Get a Sentinel policy by ID with enforcement mode and version count.',
  inputSchema: z.object({
    terraformToken: tokenField,
    policyId: z.string().describe('Policy ID, e.g. "pol-xxxxxxxxxxxx"'),
  }),
  execute: async ({ terraformToken, policyId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/policies/${encodeURIComponent(policyId)}`,
      );
      if (!result.ok) return failedResult(`Failed to get Terraform policy "${policyId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error getting Terraform policy "${policyId}"`);
    }
  },
});

export const createPolicy = tool({
  description: 'Create a Sentinel policy (code uploaded separately as a policy version).',
  inputSchema: z.object({
    terraformToken: tokenField,
    organization: orgField,
    name: z.string().describe('Policy name, e.g. "restrict-ec2-types"'),
    description: z.string().optional().describe('Policy description'),
    enforce: z
      .array(
        z.object({
          path: z.string(),
          mode: z.enum(['advisory', 'soft-mandatory', 'hard-mandatory']),
        }),
      )
      .optional()
      .describe(
        'Enforcement paths, e.g. [{"path":"restrict-ec2-types.sentinel","mode":"hard-mandatory"}]',
      ),
  }),
  execute: async ({ terraformToken, organization, name, description, enforce }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/organizations/${encodeURIComponent(organization)}/policies`,
        {
          method: 'POST',
          body: { data: { type: 'policies', attributes: { name, description, enforce } } },
        },
      );
      if (!result.ok) return failedResult('Failed to create Terraform policy', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error creating Terraform policy');
    }
  },
});

export const updatePolicy = tool({
  description: 'Update a Sentinel policy name, description, or enforcement.',
  inputSchema: z.object({
    terraformToken: tokenField,
    policyId: z.string().describe('Policy ID to update'),
    name: z.string().optional().describe('New policy name'),
    description: z.string().optional().describe('New description'),
    enforce: z
      .array(
        z.object({
          path: z.string(),
          mode: z.enum(['advisory', 'soft-mandatory', 'hard-mandatory']),
        }),
      )
      .optional()
      .describe('Replacement enforcement paths'),
  }),
  execute: async ({ terraformToken, policyId, name, description, enforce }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/policies/${encodeURIComponent(policyId)}`,
        {
          method: 'PATCH',
          body: { data: { type: 'policies', attributes: { name, description, enforce } } },
        },
      );
      if (!result.ok)
        return failedResult(`Failed to update Terraform policy "${policyId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error updating Terraform policy "${policyId}"`);
    }
  },
});

export const deletePolicy = tool({
  description: 'Delete a Sentinel policy (must be removed from policy sets first).',
  inputSchema: z.object({
    terraformToken: tokenField,
    policyId: z.string().describe('Policy ID to delete'),
  }),
  execute: async ({ terraformToken, policyId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/policies/${encodeURIComponent(policyId)}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok)
        return failedResult(`Failed to delete Terraform policy "${policyId}"`, result);
      return { success: true, policyId, statusCode: result.status };
    } catch (error) {
      return toTerraformError(error, `Error deleting Terraform policy "${policyId}"`);
    }
  },
});

export const listPolicySets = tool({
  description: 'List policy sets in an organization with workspace attachments.',
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
        `/organizations/${encodeURIComponent(organization)}/policy-sets`,
        {
          query: pageParams(pageNumber, pageSize),
        },
      );
      if (!result.ok) return failedResult('Failed to list Terraform policy sets', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error listing Terraform policy sets');
    }
  },
});

export const getPolicySet = tool({
  description: 'Get a policy set by ID with policies, workspaces, and VCS settings.',
  inputSchema: z.object({
    terraformToken: tokenField,
    policySetId: z.string().describe('Policy set ID, e.g. "polset-xxxxxxxxxxxx"'),
  }),
  execute: async ({ terraformToken, policySetId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/policy-sets/${encodeURIComponent(policySetId)}`,
      );
      if (!result.ok)
        return failedResult(`Failed to get Terraform policy set "${policySetId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error getting Terraform policy set "${policySetId}"`);
    }
  },
});

export const createPolicySet = tool({
  description: 'Create a policy set, optionally attached to workspaces or backed by a VCS repo.',
  inputSchema: z.object({
    terraformToken: tokenField,
    organization: orgField,
    name: z.string().describe('Policy set name'),
    description: z.string().optional().describe('Policy set description'),
    global: z.boolean().optional().describe('Enforce on all workspaces (default false)'),
    policyIds: z.array(z.string()).optional().describe('Policy IDs to include'),
    workspaceIds: z.array(z.string()).optional().describe('Workspace IDs to attach to'),
  }),
  execute: async ({
    terraformToken,
    organization,
    name,
    description,
    global,
    policyIds,
    workspaceIds,
  }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/organizations/${encodeURIComponent(organization)}/policy-sets`,
        {
          method: 'POST',
          body: {
            data: {
              type: 'policy-sets',
              attributes: { name, description, global },
              relationships: {
                ...(policyIds?.length
                  ? { policies: { data: policyIds.map((id) => ({ type: 'policies', id })) } }
                  : {}),
                ...(workspaceIds?.length
                  ? { workspaces: { data: workspaceIds.map((id) => ({ type: 'workspaces', id })) } }
                  : {}),
              },
            },
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create Terraform policy set', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error creating Terraform policy set');
    }
  },
});

export const updatePolicySet = tool({
  description: 'Update a policy set name, description, scope, or attachments.',
  inputSchema: z.object({
    terraformToken: tokenField,
    policySetId: z.string().describe('Policy set ID to update'),
    name: z.string().optional().describe('New name'),
    description: z.string().optional().describe('New description'),
    global: z.boolean().optional().describe('Enforce on all workspaces'),
  }),
  execute: async ({ terraformToken, policySetId, name, description, global }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/policy-sets/${encodeURIComponent(policySetId)}`,
        {
          method: 'PATCH',
          body: { data: { type: 'policy-sets', attributes: { name, description, global } } },
        },
      );
      if (!result.ok)
        return failedResult(`Failed to update Terraform policy set "${policySetId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error updating Terraform policy set "${policySetId}"`);
    }
  },
});

export const deletePolicySet = tool({
  description: 'Delete a policy set.',
  inputSchema: z.object({
    terraformToken: tokenField,
    policySetId: z.string().describe('Policy set ID to delete'),
  }),
  execute: async ({ terraformToken, policySetId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/policy-sets/${encodeURIComponent(policySetId)}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok)
        return failedResult(`Failed to delete Terraform policy set "${policySetId}"`, result);
      return { success: true, policySetId, statusCode: result.status };
    } catch (error) {
      return toTerraformError(error, `Error deleting Terraform policy set "${policySetId}"`);
    }
  },
});

export const getPolicyCheck = tool({
  description: 'Get a policy check result for a run (passed/soft-failed/hard-failed per policy).',
  inputSchema: z.object({
    terraformToken: tokenField,
    policyCheckId: z
      .string()
      .describe('Policy check ID, e.g. "polchk-xxxxxxxxxxxx" (see run relationships)'),
  }),
  execute: async ({ terraformToken, policyCheckId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/policy-checks/${encodeURIComponent(policyCheckId)}`,
      );
      if (!result.ok)
        return failedResult(`Failed to get Terraform policy check "${policyCheckId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error getting Terraform policy check "${policyCheckId}"`);
    }
  },
});

export const overridePolicyCheck = tool({
  description: 'Override soft-failed policies on a check so the run can be applied.',
  inputSchema: z.object({
    terraformToken: tokenField,
    policyCheckId: z.string().describe('Policy check ID to override'),
  }),
  execute: async ({ terraformToken, policyCheckId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/policy-checks/${encodeURIComponent(policyCheckId)}/actions/override`,
        {
          method: 'POST',
        },
      );
      if (!result.ok)
        return failedResult(`Failed to override Terraform policy check "${policyCheckId}"`, result);
      return { success: true, policyCheckId, statusCode: result.status };
    } catch (error) {
      return toTerraformError(error, `Error overriding Terraform policy check "${policyCheckId}"`);
    }
  },
});
