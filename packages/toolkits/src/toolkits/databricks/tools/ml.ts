// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { databricksRequest, failedResult, toDatabricksError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Databricks credentials JSON with workspaceUrl (e.g. https://my-workspace.cloud.databricks.com) and token (PAT or OAuth)',
  );

export const databricksListModels = tool({
  description: 'List MLflow registered models with optional name filter and pagination.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    filter: z.string().optional().describe('Search filter, e.g. "name LIKE \'churn%\'"'),
    maxResults: z.number().int().min(1).optional().describe('Maximum models per page'),
    pageToken: z.string().optional().describe('Page token from a previous response'),
  }),
  execute: async ({ databricksCredentials, filter, maxResults, pageToken }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        '/2.0/mlflow/registered-models/search',
        { query: { filter, max_results: maxResults, page_token: pageToken } },
      );
      if (!result.ok) return failedResult('Failed to list models', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing models');
    }
  },
});

export const databricksGetModel = tool({
  description: 'Get one registered model with its latest versions and aliases.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    modelName: z.string().describe('Registered model name'),
  }),
  execute: async ({ databricksCredentials, modelName }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        '/2.0/mlflow/registered-models/get',
        { query: { name: modelName } },
      );
      if (!result.ok) return failedResult('Failed to get model', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting model');
    }
  },
});

export const databricksCreateModel = tool({
  description: 'Create a registered model entry (name, description, tags).',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    modelName: z.string().describe('Registered model name'),
    description: z.string().optional().describe('Model description'),
    tags: z
      .array(z.object({ key: z.string(), value: z.string() }))
      .optional()
      .describe('Model tags'),
  }),
  execute: async ({ databricksCredentials, modelName, description, tags }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        '/2.0/mlflow/registered-models/create',
        {
          method: 'POST',
          body: {
            name: modelName,
            ...(description !== undefined ? { description } : {}),
            ...(tags !== undefined ? { tags } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create model', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error creating model');
    }
  },
});

export const databricksDeleteModel = tool({
  description: 'Delete a registered model and all its versions. Cannot be undone.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    modelName: z.string().describe('Registered model name'),
  }),
  execute: async ({ databricksCredentials, modelName }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        '/2.0/mlflow/registered-models/delete',
        { method: 'POST', body: { name: modelName } },
      );
      if (!result.ok) return failedResult('Failed to delete model', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error deleting model');
    }
  },
});

export const databricksListModelVersions = tool({
  description: 'List versions of a registered model with stages and statuses.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    modelName: z.string().describe('Registered model name'),
    maxResults: z.number().int().min(1).optional().describe('Maximum versions per page'),
    pageToken: z.string().optional().describe('Page token from a previous response'),
  }),
  execute: async ({ databricksCredentials, modelName, maxResults, pageToken }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        '/2.0/mlflow/model-versions/search',
        {
          query: { filter: `name='${modelName}'`, max_results: maxResults, page_token: pageToken },
        },
      );
      if (!result.ok) return failedResult('Failed to list model versions', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing model versions');
    }
  },
});

export const databricksCreateModelVersion = tool({
  description: 'Create a model version from a run or artifact source.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    modelName: z.string().describe('Registered model name'),
    source: z.string().describe('Source location, e.g. runs:/<run_id>/model or dbfs:/path'),
    runId: z.string().optional().describe('MLflow run ID that produced the model'),
    description: z.string().optional().describe('Version description'),
    tags: z
      .array(z.object({ key: z.string(), value: z.string() }))
      .optional()
      .describe('Version tags'),
  }),
  execute: async ({ databricksCredentials, modelName, source, runId, description, tags }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        '/2.0/mlflow/model-versions/create',
        {
          method: 'POST',
          body: {
            name: modelName,
            source,
            ...(runId !== undefined ? { run_id: runId } : {}),
            ...(description !== undefined ? { description } : {}),
            ...(tags !== undefined ? { tags } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create model version', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error creating model version');
    }
  },
});

export const databricksListServingEndpoints = tool({
  description:
    'List model serving endpoints with state and config. Use to discover deployment IDs.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
  }),
  execute: async ({ databricksCredentials }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/serving-endpoints');
      if (!result.ok) return failedResult('Failed to list serving endpoints', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing serving endpoints');
    }
  },
});

export const databricksGetServingEndpoint = tool({
  description: 'Get one serving endpoint with served entities and readiness state.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    endpointName: z.string().describe('Serving endpoint name'),
  }),
  execute: async ({ databricksCredentials, endpointName }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.0/serving-endpoints/${endpointName}`,
      );
      if (!result.ok) return failedResult('Failed to get serving endpoint', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting serving endpoint');
    }
  },
});

export const databricksQueryServingEndpoint = tool({
  description:
    'Invoke a serving endpoint for predictions or chat completions. Body follows the endpoint task schema (e.g. {"inputs": [...]} or OpenAI chat format).',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    endpointName: z.string().describe('Serving endpoint name'),
    payload: z
      .record(z.string(), z.any())
      .describe(
        'Request payload, e.g. {"inputs":[[1,2,3]]} or {"messages":[{"role":"user","content":"Hi"}]}',
      ),
  }),
  execute: async ({ databricksCredentials, endpointName, payload }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.0/serving-endpoints/${endpointName}/invocations`,
        { method: 'POST', body: payload },
      );
      if (!result.ok) return failedResult('Failed to query serving endpoint', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error querying serving endpoint');
    }
  },
});
