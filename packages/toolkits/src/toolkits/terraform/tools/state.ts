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
const wsIdField = z.string().describe('Workspace ID, e.g. "ws-xxxxxxxxxxxx"');

export const listStateVersions = tool({
  description: 'List state versions of a workspace, newest first, with serials and lineage.',
  inputSchema: z.object({
    terraformToken: tokenField,
    workspaceId: wsIdField,
    pageNumber: z.number().int().min(1).optional().describe('Page number (default 1)'),
    pageSize: z.number().int().min(1).max(100).optional().describe('Results per page (default 20)'),
  }),
  execute: async ({ terraformToken, workspaceId, pageNumber, pageSize }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/workspaces/${encodeURIComponent(workspaceId)}/state-versions`,
        {
          query: pageParams(pageNumber, pageSize),
        },
      );
      if (!result.ok) return failedResult('Failed to list Terraform state versions', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error listing Terraform state versions');
    }
  },
});

export const getStateVersion = tool({
  description: 'Get a state version by ID with download URL, serial, and lineage.',
  inputSchema: z.object({
    terraformToken: tokenField,
    stateVersionId: z.string().describe('State version ID, e.g. "sv-xxxxxxxxxxxx"'),
  }),
  execute: async ({ terraformToken, stateVersionId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/state-versions/${encodeURIComponent(stateVersionId)}`,
      );
      if (!result.ok)
        return failedResult(`Failed to get Terraform state version "${stateVersionId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error getting Terraform state version "${stateVersionId}"`);
    }
  },
});

export const getCurrentStateVersion = tool({
  description: "Get the workspace's current state version with download URL.",
  inputSchema: z.object({
    terraformToken: tokenField,
    workspaceId: wsIdField,
  }),
  execute: async ({ terraformToken, workspaceId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/workspaces/${encodeURIComponent(workspaceId)}/current-state-version`,
      );
      if (!result.ok) return failedResult('Failed to get current Terraform state version', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error getting current Terraform state version');
    }
  },
});

export const getCurrentStateVersionOutputs = tool({
  description: "Get output values of the workspace's current state (names, values, sensitivity).",
  inputSchema: z.object({
    terraformToken: tokenField,
    workspaceId: wsIdField,
    pageNumber: z.number().int().min(1).optional().describe('Page number (default 1)'),
    pageSize: z.number().int().min(1).max(100).optional().describe('Results per page (default 20)'),
  }),
  execute: async ({ terraformToken, workspaceId, pageNumber, pageSize }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/workspaces/${encodeURIComponent(workspaceId)}/current-state-version-outputs`,
        { query: pageParams(pageNumber, pageSize) },
      );
      if (!result.ok) return failedResult('Failed to get current Terraform state outputs', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error getting current Terraform state outputs');
    }
  },
});

export const getStateVersionOutputs = tool({
  description: 'Get output values of a specific state version.',
  inputSchema: z.object({
    terraformToken: tokenField,
    stateVersionId: z.string().describe('State version ID'),
    pageNumber: z.number().int().min(1).optional().describe('Page number (default 1)'),
    pageSize: z.number().int().min(1).max(100).optional().describe('Results per page (default 20)'),
  }),
  execute: async ({ terraformToken, stateVersionId, pageNumber, pageSize }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/state-versions/${encodeURIComponent(stateVersionId)}/outputs`,
        {
          query: pageParams(pageNumber, pageSize),
        },
      );
      if (!result.ok) return failedResult('Failed to get Terraform state version outputs', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error getting Terraform state version outputs');
    }
  },
});

export const createStateVersion = tool({
  description:
    'Upload a new state version (base64-encoded state JSON) for local-execution workspaces.',
  inputSchema: z.object({
    terraformToken: tokenField,
    workspaceId: wsIdField,
    state: z
      .record(z.any())
      .describe('Raw state JSON object (will be base64-encoded automatically)'),
    serial: z.number().int().optional().describe('State serial number (must exceed current)'),
    lineage: z.string().optional().describe('State lineage UUID (must match existing lineage)'),
    runId: z.string().optional().describe('Run ID to associate with this state version'),
  }),
  execute: async ({ terraformToken, workspaceId, state, serial, lineage, runId }) => {
    try {
      const encoded = Buffer.from(JSON.stringify(state)).toString('base64');
      const result = await terraformRequest(
        terraformToken,
        `/workspaces/${encodeURIComponent(workspaceId)}/state-versions`,
        {
          method: 'POST',
          body: {
            data: {
              type: 'state-versions',
              attributes: { serial, lineage, state: encoded },
              ...(runId ? { relationships: { run: { data: { type: 'runs', id: runId } } } } : {}),
            },
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create Terraform state version', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error creating Terraform state version');
    }
  },
});
