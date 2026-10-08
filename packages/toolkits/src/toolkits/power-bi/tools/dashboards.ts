// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { powerBiRequest, failedResult, toPowerBiError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const powerBiListDashboardsInGroup = tool({
  description: 'List dashboards in a workspace (GET /groups/{groupId}/dashboards).',
  inputSchema: z.object({
    powerBiCredentials: credField,
    groupId: z.string().uuid(),
  }),
  execute: async ({ powerBiCredentials, groupId }) => {
    try {
      const result = await powerBiRequest(
        powerBiCredentials,
        `/groups/${encodeURIComponent(groupId)}/dashboards`,
      );
      if (!result.ok) return failedResult('Failed to list dashboards', result);
      return result.data;
    } catch (error) {
      return toPowerBiError(error, 'Error listing dashboards');
    }
  },
});

export const powerBiGetDashboardInGroup = tool({
  description: 'Get dashboard metadata (GET /groups/{groupId}/dashboards/{dashboardId}).',
  inputSchema: z.object({
    powerBiCredentials: credField,
    groupId: z.string().uuid(),
    dashboardId: z.string().uuid(),
  }),
  execute: async ({ powerBiCredentials, groupId, dashboardId }) => {
    try {
      const result = await powerBiRequest(
        powerBiCredentials,
        `/groups/${encodeURIComponent(groupId)}/dashboards/${encodeURIComponent(dashboardId)}`,
      );
      if (!result.ok) return failedResult('Failed to get dashboard', result);
      return result.data;
    } catch (error) {
      return toPowerBiError(error, 'Error getting dashboard');
    }
  },
});
