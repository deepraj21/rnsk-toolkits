import { tool } from 'ai';
import { z } from 'zod';
import { DescribeEndpointCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsDescribeEventbridgeEndpoint = tool({
  description: 'Get details about an EventBridge endpoint. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('Name of the endpoint'),
    homeRegion: z.string().optional().describe('Home region'),
  }),
  execute: async ({ awsCredentials, region, name, homeRegion }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEventBridgeClient(awsCredentials, region);

      const command = new DescribeEndpointCommand({
          Name: name,
          HomeRegion: homeRegion,
      });
      const response = await client.send(command);
      return {
                  endpoint: response,
              };
    } catch (err) {
      return { error: 'Failed to get details about an EventBridge endpoint', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
