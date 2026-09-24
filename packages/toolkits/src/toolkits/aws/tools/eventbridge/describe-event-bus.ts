import { tool } from 'ai';
import { z } from 'zod';
import { DescribeEventBusCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsDescribeEventbridgeEventBus = tool({
  description: 'Get details about an EventBridge event bus. Use it to inspect current state before making changes.',
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

      const command = new DescribeEventBusCommand({
          Name: name,
      });
      const response = await client.send(command);
      return {
                  eventBus: response,
              };
    } catch (err) {
      return { error: 'Failed to get details about an EventBridge event bus', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
