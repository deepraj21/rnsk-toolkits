// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { makeRequest, failedResult, toMakeError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Make credentials JSON with baseUrl (zone URL, e.g. https://eu1.make.com) and apiToken',
  );
const scenarioIdField = z.number().int().describe('Scenario ID from List Scenarios');
const pagingFields = {
  limit: z.number().int().min(1).optional().describe('Maximum records to return'),
  offset: z.number().int().min(0).optional().describe('Records to skip'),
};

export const makeListScenarios = tool({
  description:
    'List Make scenarios for a team with optional name and active-state filters. Use to discover scenario IDs.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    teamId: z.number().int().describe('Team ID whose scenarios to list'),
    name: z.string().optional().describe('Case-insensitive substring filter on scenario name'),
    isActive: z.boolean().optional().describe('Set true to return only active scenarios'),
    ...pagingFields,
  }),
  execute: async ({ makeCredentials, teamId, name, isActive, limit, offset }) => {
    try {
      const result = await makeRequest(makeCredentials, '/scenarios', {
        query: {
          teamId,
          name,
          isActive,
          'pg[limit]': limit,
          'pg[offset]': offset,
        },
      });
      if (!result.ok) return failedResult('Failed to list scenarios', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error listing scenarios');
    }
  },
});

export const makeGetScenario = tool({
  description: 'Retrieve one Make scenario by ID with optional selected columns.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    scenarioId: scenarioIdField,
    columns: z.array(z.string()).optional().describe('Scenario fields to include in the response'),
  }),
  execute: async ({ makeCredentials, scenarioId, columns }) => {
    try {
      const result = await makeRequest(makeCredentials, `/scenarios/${scenarioId}`, {
        query: { 'cols[]': columns },
      });
      if (!result.ok) return failedResult('Failed to get scenario', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error getting scenario');
    }
  },
});

export const makeDeleteScenario = tool({
  description:
    'Move a Make scenario to trash, where it can be restored for 30 days. Use when decommissioning an automation.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    scenarioId: scenarioIdField,
  }),
  execute: async ({ makeCredentials, scenarioId }) => {
    try {
      const result = await makeRequest(makeCredentials, `/scenarios/${scenarioId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete scenario', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error deleting scenario');
    }
  },
});

export const makeUpdateScenario = tool({
  description:
    'Update a Make scenario by ID: rename, replace blueprint or scheduling, change description or folder. Unprovided properties stay unchanged.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    scenarioId: scenarioIdField,
    name: z.string().optional().describe('New scenario name'),
    blueprint: z
      .union([z.string(), z.record(z.string(), z.any())])
      .optional()
      .describe('Scenario blueprint as a JSON string (objects are stringified automatically)'),
    scheduling: z
      .union([z.string(), z.record(z.string(), z.any())])
      .optional()
      .describe(
        'Scheduling details as a JSON string, e.g. {"type":"on-demand"} (objects are stringified automatically)',
      ),
    description: z.string().optional().describe('New scenario description'),
    folderId: z
      .number()
      .int()
      .nullable()
      .optional()
      .describe('Move scenario to this folder ID (null removes folder assignment)'),
    confirmed: z
      .boolean()
      .optional()
      .describe('Confirm changes such as scheduling switches (sent as ?confirmed=true)'),
  }),
  execute: async ({
    makeCredentials,
    scenarioId,
    name,
    blueprint,
    scheduling,
    description,
    folderId,
    confirmed,
  }) => {
    try {
      const result = await makeRequest(makeCredentials, `/scenarios/${scenarioId}`, {
        method: 'PATCH',
        query: confirmed === true ? { confirmed: true } : undefined,
        body: {
          ...(name !== undefined ? { name } : {}),
          ...(blueprint !== undefined
            ? { blueprint: typeof blueprint === 'string' ? blueprint : JSON.stringify(blueprint) }
            : {}),
          ...(scheduling !== undefined
            ? {
                scheduling:
                  typeof scheduling === 'string' ? scheduling : JSON.stringify(scheduling),
              }
            : {}),
          ...(description !== undefined ? { description } : {}),
          ...(folderId !== undefined ? { folderId } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to update scenario', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error updating scenario');
    }
  },
});

export const makeGetScenarioBlueprint = tool({
  description:
    'Retrieve the current, draft, or a historical blueprint of a Make scenario. Credential-bearing fields are omitted by the API.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    scenarioId: scenarioIdField,
    draft: z.boolean().optional().describe('Retrieve the draft blueprint instead of current'),
    blueprintId: z.number().int().optional().describe('Historical blueprint version ID'),
  }),
  execute: async ({ makeCredentials, scenarioId, draft, blueprintId }) => {
    try {
      const result = await makeRequest(makeCredentials, `/scenarios/${scenarioId}/blueprint`, {
        query: { draft, blueprintId },
      });
      if (!result.ok) return failedResult('Failed to get scenario blueprint', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error getting scenario blueprint');
    }
  },
});

export const makeGetScenarioInterface = tool({
  description: "Retrieve a Make scenario's declared input and output interface.",
  inputSchema: z.object({
    makeCredentials: credentialsField,
    scenarioId: scenarioIdField,
  }),
  execute: async ({ makeCredentials, scenarioId }) => {
    try {
      const result = await makeRequest(makeCredentials, `/scenarios/${scenarioId}/interface`);
      if (!result.ok) return failedResult('Failed to get scenario interface', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error getting scenario interface');
    }
  },
});

export const makeUpdateScenarioInterface = tool({
  description:
    'Update a Make scenario inputs specification. Enable scenario inputs first by switching scheduling to on-demand; send an empty input array to disable inputs. Requires Pro plan or higher.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    scenarioId: scenarioIdField,
    interface: z
      .record(z.string(), z.any())
      .describe('Interface spec object with an input array of scenario input parameters'),
  }),
  execute: async ({ makeCredentials, scenarioId, interface: iface }) => {
    try {
      const result = await makeRequest(makeCredentials, `/scenarios/${scenarioId}/interface`, {
        method: 'PATCH',
        body: { interface: iface },
      });
      if (!result.ok) return failedResult('Failed to update scenario interface', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error updating scenario interface');
    }
  },
});

export const makeGetScenarioLogs = tool({
  description:
    'List scenario execution logs, list one module operation logs, or retrieve one execution log, depending on the identifiers supplied.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    scenarioId: scenarioIdField,
    executionId: z
      .string()
      .optional()
      .describe('Execution ID to retrieve (cannot be combined with moduleId)'),
    moduleId: z
      .number()
      .int()
      .optional()
      .describe('Module ID to list operation logs for (cannot be combined with executionId)'),
    ...pagingFields,
  }),
  execute: async ({ makeCredentials, scenarioId, executionId, moduleId, limit, offset }) => {
    try {
      const path = executionId
        ? `/scenarios/${scenarioId}/logs/${executionId}`
        : moduleId
          ? `/scenarios/${scenarioId}/modules/${moduleId}/logs`
          : `/scenarios/${scenarioId}/logs`;
      const result = await makeRequest(makeCredentials, path, {
        query: { 'pg[limit]': limit, 'pg[offset]': offset },
      });
      if (!result.ok) return failedResult('Failed to get scenario logs', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error getting scenario logs');
    }
  },
});

export const makeGetScenarioTriggers = tool({
  description:
    'Retrieve trigger details of a Make scenario without exposing its URL or UDID. Returns an empty object when no trigger is configured.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    scenarioId: scenarioIdField,
  }),
  execute: async ({ makeCredentials, scenarioId }) => {
    try {
      const result = await makeRequest(makeCredentials, `/scenarios/${scenarioId}/triggers`);
      if (!result.ok) return failedResult('Failed to get scenario triggers', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error getting scenario triggers');
    }
  },
});

export const makeListIncompleteExecutions = tool({
  description:
    'List incomplete (DLQ) executions of a Make scenario with optional status and creation-time filters. Use to find failed runs to resolve manually.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    scenarioId: scenarioIdField,
    status: z
      .enum(['resolved', 'scheduled', 'inprogress', 'unresolved'])
      .optional()
      .describe('Filter by derived retry status'),
    createdFrom: z
      .number()
      .int()
      .optional()
      .describe('Only executions created on or after this Unix timestamp in milliseconds'),
    createdTo: z
      .number()
      .int()
      .optional()
      .describe('Only executions created on or before this Unix timestamp in milliseconds'),
  }),
  execute: async ({ makeCredentials, scenarioId, status, createdFrom, createdTo }) => {
    try {
      const result = await makeRequest(makeCredentials, '/dlqs', {
        query: { scenarioId, status, createdFrom, createdTo },
      });
      if (!result.ok) return failedResult('Failed to list incomplete executions', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error listing incomplete executions');
    }
  },
});
