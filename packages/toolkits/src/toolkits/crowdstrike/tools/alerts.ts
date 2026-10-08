// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { crowdstrikeRequest, failedResult, toCrowdstrikeError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const crowdstrikeQueryAlerts = tool({
  description: 'Query alert composite IDs (GET /alerts/queries/alerts/v2) with FQL filter.',
  inputSchema: z.object({
    crowdstrikeCredentials: credField,
    filter: z.string().optional().describe('FQL filter on alerts'),
    limit: z.number().int().optional(),
    offset: z.number().int().optional(),
    sort: z.string().optional(),
    q: z.string().optional().describe('Search string across alert metadata'),
  }),
  execute: async ({ crowdstrikeCredentials, filter, limit, offset, sort, q }) => {
    try {
      const result = await crowdstrikeRequest(crowdstrikeCredentials, '/alerts/queries/alerts/v2', {
        query: { filter, limit, offset, sort, q },
      });
      if (!result.ok) return failedResult('Failed to query alerts', result);
      return result.data;
    } catch (error) {
      return toCrowdstrikeError(error, 'Error querying alerts');
    }
  },
});

export const crowdstrikeGetAlerts = tool({
  description: 'Get alert details (POST /alerts/entities/alerts/v2) by composite IDs.',
  inputSchema: z.object({
    crowdstrikeCredentials: credField,
    compositeIds: z.array(z.string()).min(1).describe('Alert composite IDs from query'),
  }),
  execute: async ({ crowdstrikeCredentials, compositeIds }) => {
    try {
      const result = await crowdstrikeRequest(
        crowdstrikeCredentials,
        '/alerts/entities/alerts/v2',
        { method: 'POST', body: { composite_ids: compositeIds } },
      );
      if (!result.ok) return failedResult('Failed to get alerts', result);
      return result.data;
    } catch (error) {
      return toCrowdstrikeError(error, 'Error getting alerts');
    }
  },
});

export const crowdstrikeUpdateAlerts = tool({
  description:
    'Update alert status or assignment (PATCH /alerts/entities/alerts/v3) for composite IDs.',
  inputSchema: z.object({
    crowdstrikeCredentials: credField,
    compositeIds: z.array(z.string()).min(1),
    status: z.string().optional().describe('New status, e.g. in_progress, closed, new'),
    assignedToUuid: z.string().optional().describe('Assignee user UUID'),
    appendComment: z.string().optional().describe('Comment to append'),
  }),
  execute: async ({
    crowdstrikeCredentials,
    compositeIds,
    status,
    assignedToUuid,
    appendComment,
  }) => {
    try {
      const body: Record<string, unknown> = {
        composite_ids: compositeIds,
      };
      if (status !== undefined) body.status = status;
      if (assignedToUuid !== undefined) body.assigned_to_uuid = assignedToUuid;
      if (appendComment !== undefined) body.append_comment = appendComment;
      const result = await crowdstrikeRequest(
        crowdstrikeCredentials,
        '/alerts/entities/alerts/v3',
        { method: 'PATCH', body },
      );
      if (!result.ok) return failedResult('Failed to update alerts', result);
      return result.data;
    } catch (error) {
      return toCrowdstrikeError(error, 'Error updating alerts');
    }
  },
});
