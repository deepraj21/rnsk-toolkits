import { tool } from 'ai';
import { z } from 'zod';
import { DescribeConnectionCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsDescribeEventbridgeConnection = tool({
  description: 'Get details about an EventBridge connection. Use it to inspect current state before making changes.',
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

      const command = new DescribeConnectionCommand({
          Name: name,
      });
      const response = await client.send(command);
      return {
                  connection: response,
              };
    } catch (err) {
      return { error: 'Failed to get details about an EventBridge connection', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
