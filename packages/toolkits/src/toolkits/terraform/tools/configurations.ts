// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { failedResult, terraformRequest, toTerraformError } from './client.js';

const tokenField = z
  .string()
  .optional()
  .describe(
    'Injected Terraform API token (user, team, or organization token) — match manifest tokenField',
  );

export const createConfigurationVersion = tool({
  description:
    'Create a configuration version on a workspace (step 1 of the API-driven run workflow). Returns an upload URL for the config tarball.',
  inputSchema: z.object({
    terraformToken: tokenField,
    workspaceId: z.string().describe('Workspace ID'),
    autoQueueRuns: z
      .boolean()
      .optional()
      .describe('Automatically queue a run when files upload completes (default true)'),
    speculative: z.boolean().optional().describe('Plan-only speculative version (default false)'),
    provisional: z
      .boolean()
      .optional()
      .describe('Provisional version for saved-plan runs (default false)'),
  }),
  execute: async ({ terraformToken, workspaceId, autoQueueRuns, speculative, provisional }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/workspaces/${encodeURIComponent(workspaceId)}/configuration-versions`,
        {
          method: 'POST',
          body: {
            data: {
              type: 'configuration-versions',
              attributes: {
                'auto-queue-runs': autoQueueRuns,
                speculative,
                provisional,
              },
            },
          },
        },
      );
      if (!result.ok)
        return failedResult('Failed to create Terraform configuration version', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error creating Terraform configuration version');
    }
  },
});

export const getConfigurationVersion = tool({
  description: 'Get a configuration version with source and upload status.',
  inputSchema: z.object({
    terraformToken: tokenField,
    configurationVersionId: z.string().describe('Configuration version ID, e.g. "cv-xxxxxxxxxxxx"'),
  }),
  execute: async ({ terraformToken, configurationVersionId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/configuration-versions/${encodeURIComponent(configurationVersionId)}`,
      );
      if (!result.ok)
        return failedResult(
          `Failed to get Terraform configuration version "${configurationVersionId}"`,
          result,
        );
      return result.data;
    } catch (error) {
      return toTerraformError(
        error,
        `Error getting Terraform configuration version "${configurationVersionId}"`,
      );
    }
  },
});

export const uploadConfigurationVersion = tool({
  description:
    'Upload a .tar.gz configuration bundle (base64-encoded) to a configuration version upload URL (step 2 of the API-driven run workflow).',
  inputSchema: z.object({
    terraformToken: tokenField,
    uploadUrl: z
      .string()
      .describe('Upload URL from createConfigurationVersion (attributes.upload-url)'),
    contentBase64: z
      .string()
      .describe('Base64-encoded .tar.gz bundle of the Terraform configuration'),
  }),
  execute: async ({ terraformToken, uploadUrl, contentBase64 }) => {
    try {
      if (!terraformToken) {
        return { error: 'Terraform API token is required. Connect Terraform first.' };
      }
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: Buffer.from(contentBase64, 'base64'),
      });
      if (!response.ok) {
        const details = await response.text().catch(() => null);
        return {
          error: 'Failed to upload Terraform configuration version',
          statusCode: response.status,
          details,
        };
      }
      return { success: true, statusCode: response.status };
    } catch (error) {
      return toTerraformError(error, 'Error uploading Terraform configuration version');
    }
  },
});
