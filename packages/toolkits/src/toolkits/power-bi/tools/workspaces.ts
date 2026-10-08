// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { powerBiRequest, failedResult, toPowerBiError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const powerBiListGroups = tool({
  description:
    'List Power BI workspaces (groups) the caller can access (GET /groups). Filter by $filter OData when needed.',
  inputSchema: z.object({
    powerBiCredentials: credField,
    filter: z.string().optional().describe('OData $filter expression'),
    top: z.number().int().optional().describe('$top page size'),
    skip: z.number().int().optional(),
  }),
  execute: async ({ powerBiCredentials, filter, top, skip }) => {
    try {
      const result = await powerBiRequest(powerBiCredentials, '/groups', {
        query: { $filter: filter, $top: top, $skip: skip },
      });
      if (!result.ok) return failedResult('Failed to list workspaces', result);
      return result.data;
    } catch (error) {
      return toPowerBiError(error, 'Error listing workspaces');
    }
  },
});

export const powerBiGetGroup = tool({
  description: 'Get one workspace by ID (GET /groups/{groupId}).',
  inputSchema: z.object({
    powerBiCredentials: credField,
    groupId: z.string().uuid().describe('Workspace (group) ID'),
  }),
  execute: async ({ powerBiCredentials, groupId }) => {
    try {
      const result = await powerBiRequest(
        powerBiCredentials,
        `/groups/${encodeURIComponent(groupId)}`,
      );
      if (!result.ok) return failedResult('Failed to get workspace', result);
      return result.data;
    } catch (error) {
      return toPowerBiError(error, 'Error getting workspace');
    }
  },
});

export const powerBiCreateGroup = tool({
  description: 'Create a workspace (POST /groups). Requires name; optional capacity and type.',
  inputSchema: z.object({
    powerBiCredentials: credField,
    name: z.string().describe('Workspace display name'),
    capacityId: z.string().uuid().optional(),
  }),
  execute: async ({ powerBiCredentials, name, capacityId }) => {
    try {
      const result = await powerBiRequest(powerBiCredentials, '/groups', {
        method: 'POST',
        body: { name, capacityId },
      });
      if (!result.ok) return failedResult('Failed to create workspace', result);
      return result.data;
    } catch (error) {
      return toPowerBiError(error, 'Error creating workspace');
    }
  },
});
