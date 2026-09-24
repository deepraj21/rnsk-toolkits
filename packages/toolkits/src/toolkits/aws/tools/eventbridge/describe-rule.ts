import { tool } from 'ai';
import { z } from 'zod';
import { DescribeRuleCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsDescribeEventbridgeRule = tool({
  description: 'Get details about an EventBridge rule. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('Name of the rule'),
    eventBusName: z.string().optional().describe('Event bus name'),
  }),
  execute: async ({ awsCredentials, region, name, eventBusName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEventBridgeClient(awsCredentials, region);

      const command = new DescribeRuleCommand({
          Name: name,
          EventBusName: eventBusName,
      });
      const response = await client.send(command);
      return {
                  rule: response,
              };
    } catch (err) {
      return { error: 'Failed to get details about an EventBridge rule', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
