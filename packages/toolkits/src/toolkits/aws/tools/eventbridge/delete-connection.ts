import { tool } from 'ai';
import { z } from 'zod';
import { DeleteConnectionCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsDeleteEventbridgeConnection = tool({
  description: 'Delete an EventBridge connection. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('Name of the connection'),
  }),
  execute: async ({ awsCredentials, region, name }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEventBridgeClient(awsCredentials, region);

      const command = new DeleteConnectionCommand({
          Name: name,
      });
      await client.send(command);
      return {
                  message: 'Connection deleted successfully',
                  name: name,
              };
    } catch (err) {
      return { error: 'Failed to delete an EventBridge connection', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
