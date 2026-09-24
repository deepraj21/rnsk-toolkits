import { tool } from 'ai';
import { z } from 'zod';
import { DeleteEventBusCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsDeleteEventbridgeEventBus = tool({
  description: 'Delete an EventBridge event bus. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('Name of the event bus'),
  }),
  execute: async ({ awsCredentials, region, name }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEventBridgeClient(awsCredentials, region);

      const command = new DeleteEventBusCommand({
          Name: name,
      });
      await client.send(command);
      return {
                  message: 'Event bus deleted successfully',
                  name: name,
              };
    } catch (err) {
      return { error: 'Failed to delete an EventBridge event bus', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
