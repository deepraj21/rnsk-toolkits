// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { crowdstrikeRequest, failedResult, toCrowdstrikeError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const crowdstrikeQueryIncidents = tool({
  description: 'Query incident IDs (GET /incidents/queries/incidents/v1) with optional FQL filter.',
  inputSchema: z.object({
    crowdstrikeCredentials: credField,
    filter: z.string().optional().describe('FQL filter'),
    limit: z.number().int().optional(),
    offset: z.number().int().optional(),
    sort: z.string().optional(),
  }),
  execute: async ({ crowdstrikeCredentials, filter, limit, offset, sort }) => {
    try {
      const result = await crowdstrikeRequest(
        crowdstrikeCredentials,
        '/incidents/queries/incidents/v1',
        { query: { filter, limit, offset, sort } },
      );
      if (!result.ok) return failedResult('Failed to query incidents', result);
      return result.data;
    } catch (error) {
      return toCrowdstrikeError(error, 'Error querying incidents');
    }
  },
});

export const crowdstrikeGetIncidents = tool({
  description: 'Get incident details by IDs (POST /incidents/entities/incidents/GET/v1).',
  inputSchema: z.object({
    crowdstrikeCredentials: credField,
    ids: z.array(z.string()).min(1).describe('Incident IDs'),
  }),
  execute: async ({ crowdstrikeCredentials, ids }) => {
    try {
      const result = await crowdstrikeRequest(
        crowdstrikeCredentials,
        '/incidents/entities/incidents/GET/v1',
        { method: 'POST', body: { ids } },
      );
      if (!result.ok) return failedResult('Failed to get incidents', result);
      return result.data;
    } catch (error) {
      return toCrowdstrikeError(error, 'Error getting incidents');
    }
  },
});

export const crowdstrikePerformIncidentAction = tool({
  description:
    'Perform an incident action such as close or update (POST /incidents/entities/incident-actions/v1).',
  inputSchema: z.object({
    crowdstrikeCredentials: credField,
    ids: z.array(z.string()).min(1).describe('Incident IDs'),
    actionName: z
      .string()
      .describe('Action name, e.g. add_tag, delete_tag, update_status, assign_to_user'),
    actionParameters: z
      .record(z.string(), z.any())
      .optional()
      .describe('Action-specific parameters object'),
  }),
  execute: async ({ crowdstrikeCredentials, ids, actionName, actionParameters }) => {
    try {
      const result = await crowdstrikeRequest(
        crowdstrikeCredentials,
        '/incidents/entities/incident-actions/v1',
        {
          method: 'POST',
          query: { action_name: actionName },
          body: {
            ids,
            ...(actionParameters !== undefined ? { action_parameters: actionParameters } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to perform incident action', result);
      return result.data;
    } catch (error) {
      return toCrowdstrikeError(error, 'Error performing incident action');
    }
  },
});
