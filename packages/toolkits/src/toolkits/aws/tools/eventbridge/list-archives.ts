import { tool } from 'ai';
import { z } from 'zod';
import { ListArchivesCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsListEventbridgeArchives = tool({
  description: 'List EventBridge archives. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    namePrefix: z.string().optional().describe('Filter by name prefix'),
    eventSourceArn: z.string().optional().describe('Filter by event source ARN'),
    state: z.enum(['ENABLED', 'DISABLED', 'CREATING', 'UPDATING', 'CREATE_FAILED', 'UPDATE_FAILED']).optional().describe('Filter by state'),
    nextToken: z.string().optional().describe('Token for pagination'),
    limit: z.number().optional().describe('Maximum number of archives to return'),
  }),
  execute: async ({ awsCredentials, region, namePrefix, eventSourceArn, state, nextToken, limit }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEventBridgeClient(awsCredentials, region);

      const command = new ListArchivesCommand({
          NamePrefix: namePrefix,
          EventSourceArn: eventSourceArn,
          State: state as any,
          NextToken: nextToken,
          Limit: limit,
      });
      const response = await client.send(command);
      return {
                  archives: response.Archives || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list EventBridge archives', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
