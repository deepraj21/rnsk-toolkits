// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { powerBiRequest, failedResult, toPowerBiError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const powerBiListDatasetsInGroup = tool({
  description: 'List datasets in a workspace (GET /groups/{groupId}/datasets).',
  inputSchema: z.object({
    powerBiCredentials: credField,
    groupId: z.string().uuid(),
  }),
  execute: async ({ powerBiCredentials, groupId }) => {
    try {
      const result = await powerBiRequest(
        powerBiCredentials,
        `/groups/${encodeURIComponent(groupId)}/datasets`,
      );
      if (!result.ok) return failedResult('Failed to list datasets', result);
      return result.data;
    } catch (error) {
      return toPowerBiError(error, 'Error listing datasets');
    }
  },
});

export const powerBiGetDatasetInGroup = tool({
  description: 'Get dataset metadata (GET /groups/{groupId}/datasets/{datasetId}).',
  inputSchema: z.object({
    powerBiCredentials: credField,
    groupId: z.string().uuid(),
    datasetId: z.string().uuid(),
  }),
  execute: async ({ powerBiCredentials, groupId, datasetId }) => {
    try {
      const result = await powerBiRequest(
        powerBiCredentials,
        `/groups/${encodeURIComponent(groupId)}/datasets/${encodeURIComponent(datasetId)}`,
      );
      if (!result.ok) return failedResult('Failed to get dataset', result);
      return result.data;
    } catch (error) {
      return toPowerBiError(error, 'Error getting dataset');
    }
  },
});

export const powerBiRefreshDataset = tool({
  description:
    'Trigger dataset refresh (POST /groups/{groupId}/datasets/{datasetId}/refreshes). Optional notifyOption and type.',
  inputSchema: z.object({
    powerBiCredentials: credField,
    groupId: z.string().uuid(),
    datasetId: z.string().uuid(),
    notifyOption: z.enum(['NoNotification', 'MailOnFailure', 'MailOnCompletion']).optional(),
    type: z.enum(['Full', 'ClearValues', 'Calculate']).optional(),
    commitMode: z.enum(['Transactional', 'PartialBatch']).optional(),
    maxParallelism: z.number().int().optional(),
    retryCount: z.number().int().optional(),
    objects: z.array(z.record(z.any())).optional().describe('Partial refresh table objects'),
  }),
  execute: async ({
    powerBiCredentials,
    groupId,
    datasetId,
    notifyOption,
    type,
    commitMode,
    maxParallelism,
    retryCount,
    objects,
  }) => {
    try {
      const body: Record<string, unknown> = {};
      if (notifyOption) body.notifyOption = notifyOption;
      if (type) body.type = type;
      if (commitMode) body.commitMode = commitMode;
      if (maxParallelism !== undefined) body.maxParallelism = maxParallelism;
      if (retryCount !== undefined) body.retryCount = retryCount;
      if (objects) body.objects = objects;

      const result = await powerBiRequest(
        powerBiCredentials,
        `/groups/${encodeURIComponent(groupId)}/datasets/${encodeURIComponent(datasetId)}/refreshes`,
        {
          method: 'POST',
          body: Object.keys(body).length ? body : undefined,
        },
      );
      if (!result.ok) return failedResult('Failed to refresh dataset', result);
      return result.data ?? { status: result.status, accepted: true };
    } catch (error) {
      return toPowerBiError(error, 'Error refreshing dataset');
    }
  },
});

export const powerBiListDatasetRefreshes = tool({
  description:
    'List refresh history for a dataset (GET /groups/{groupId}/datasets/{datasetId}/refreshes).',
  inputSchema: z.object({
    powerBiCredentials: credField,
    groupId: z.string().uuid(),
    datasetId: z.string().uuid(),
    top: z.number().int().optional(),
  }),
  execute: async ({ powerBiCredentials, groupId, datasetId, top }) => {
    try {
      const result = await powerBiRequest(
        powerBiCredentials,
        `/groups/${encodeURIComponent(groupId)}/datasets/${encodeURIComponent(datasetId)}/refreshes`,
        { query: { $top: top } },
      );
      if (!result.ok) return failedResult('Failed to list dataset refreshes', result);
      return result.data;
    } catch (error) {
      return toPowerBiError(error, 'Error listing dataset refreshes');
    }
  },
});

export const powerBiExecuteDatasetQuery = tool({
  description:
    'Run DAX or MDX against a dataset (POST /groups/{groupId}/datasets/{datasetId}/executeQueries).',
  inputSchema: z.object({
    powerBiCredentials: credField,
    groupId: z.string().uuid(),
    datasetId: z.string().uuid(),
    queries: z
      .array(
        z.object({
          query: z.string().describe('DAX query text'),
          serializerSettings: z.record(z.any()).optional(),
        }),
      )
      .min(1),
    impersonatedUserName: z.string().optional(),
  }),
  execute: async ({ powerBiCredentials, groupId, datasetId, queries, impersonatedUserName }) => {
    try {
      const result = await powerBiRequest(
        powerBiCredentials,
        `/groups/${encodeURIComponent(groupId)}/datasets/${encodeURIComponent(datasetId)}/executeQueries`,
        {
          method: 'POST',
          body: {
            queries,
            impersonatedUserName,
          },
        },
      );
      if (!result.ok) return failedResult('Failed to execute dataset query', result);
      return result.data;
    } catch (error) {
      return toPowerBiError(error, 'Error executing dataset query');
    }
  },
});
