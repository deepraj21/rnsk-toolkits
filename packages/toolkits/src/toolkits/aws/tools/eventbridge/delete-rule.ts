import { tool } from 'ai';
import { z } from 'zod';
import { DeleteRuleCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsDeleteEventbridgeRule = tool({
  description: 'Delete an EventBridge rule. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('Name of the rule'),
    eventBusName: z.string().optional().describe('Event bus name'),
    force: z.boolean().optional().describe('Force deletion even if targets exist'),
  }),
  execute: async ({ awsCredentials, region, name, eventBusName, force }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEventBridgeClient(awsCredentials, region);

      const command = new DeleteRuleCommand({
          Name: name,
          EventBusName: eventBusName,
          Force: force,
      });
      await client.send(command);
      return {
                  message: 'Rule deleted successfully',
                  name: name,
              };
    } catch (err) {
      return { error: 'Failed to delete an EventBridge rule', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
