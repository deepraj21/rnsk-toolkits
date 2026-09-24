import { tool } from 'ai';
import { z } from 'zod';
import { ListReplaysCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsListEventbridgeReplays = tool({
  description: 'List EventBridge replays. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    namePrefix: z.string().optional().describe('Filter by name prefix'),
    state: z.enum(['STARTING', 'RUNNING', 'CANCELLING', 'CANCELLED', 'COMPLETED', 'FAILED']).optional().describe('Filter by state'),
    eventSourceArn: z.string().optional().describe('Filter by event source ARN'),
    nextToken: z.string().optional().describe('Token for pagination'),
    limit: z.number().optional().describe('Maximum number of replays to return'),
  }),
  execute: async ({ awsCredentials, region, namePrefix, state, eventSourceArn, nextToken, limit }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEventBridgeClient(awsCredentials, region);

      const command = new ListReplaysCommand({
          NamePrefix: namePrefix,
          State: state as any,
          EventSourceArn: eventSourceArn,
          NextToken: nextToken,
          Limit: limit,
      });
      const response = await client.send(command);
      return {
                  replays: response.Replays || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list EventBridge replays', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
