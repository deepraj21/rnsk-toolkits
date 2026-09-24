import { tool } from 'ai';
import { z } from 'zod';
import { ListEventBusesCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsListEventbridgeEventBuses = tool({
  description: 'List EventBridge event buses. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    namePrefix: z.string().optional().describe('Filter by name prefix'),
    nextToken: z.string().optional().describe('Token for pagination'),
    limit: z.number().optional().describe('Maximum number of buses to return'),
  }),
  execute: async ({ awsCredentials, region, namePrefix, nextToken, limit }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEventBridgeClient(awsCredentials, region);

      const command = new ListEventBusesCommand({
          NamePrefix: namePrefix,
          NextToken: nextToken,
          Limit: limit,
      });
      const response = await client.send(command);
      return {
                  eventBuses: response.EventBuses || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list EventBridge event buses', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
