import { tool } from 'ai';
import { z } from 'zod';
import { EnableRuleCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsEnableEventbridgeRule = tool({
  description: 'Enable an EventBridge rule. Use it to enable a feature.',
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

      const command = new EnableRuleCommand({
          Name: name,
          EventBusName: eventBusName,
      });
      await client.send(command);
      return {
                  message: 'Rule enabled successfully',
                  name: name,
              };
    } catch (err) {
      return { error: 'Failed to enable an EventBridge rule', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
