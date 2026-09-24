import { tool } from 'ai';
import { z } from 'zod';
import { GetResourceConfigHistoryCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsGetResourceConfigHistory = tool({
  description: 'Returns a list of configuration items for the specified resource. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceType: z.string().describe('The type of the resource'),
    resourceId: z.string().describe('The ID of the resource'),
    laterTime: z.string().optional().describe('The time stamp that indicates a later time'),
    earlierTime: z.string().optional().describe('The time stamp that indicates an earlier time'),
    chronologicalOrder: z.enum(['Reverse', 'Forward']).optional().describe('Chronological order'),
    limit: z.number().optional().describe('Maximum number of results to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, resourceType, resourceId, laterTime, earlierTime, chronologicalOrder, limit, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new GetResourceConfigHistoryCommand({
          resourceType: resourceType,
          resourceId: resourceId,
          laterTime: laterTime ? new Date(laterTime) : undefined,
          earlierTime: earlierTime ? new Date(earlierTime) : undefined,
          chronologicalOrder: chronologicalOrder,
          limit: limit,
          nextToken: nextToken,
      } as any);
      const response = await client.send(command);
      return {
                  configurationItems: response.configurationItems || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to returns a list of configuration items for the specified resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
