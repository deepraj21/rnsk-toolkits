import { tool } from 'ai';
import { z } from 'zod';
import { RemoveTargetsCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsRemoveEventbridgeTargets = tool({
  description: 'Remove targets from an EventBridge rule. Use it to remove access or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    rule: z.string().describe('Name of the rule'),
    ids: z.array(z.string()).describe('Array of target IDs to remove'),
    eventBusName: z.string().optional().describe('Event bus name'),
    force: z.boolean().optional().describe('Force removal'),
  }),
  execute: async ({ awsCredentials, region, rule, ids, eventBusName, force }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEventBridgeClient(awsCredentials, region);

      const command = new RemoveTargetsCommand({
          Rule: rule,
          Ids: ids,
          EventBusName: eventBusName,
          Force: force,
      });
      const response = await client.send(command);
      return {
                  failedEntryCount: response.FailedEntryCount,
                  failedEntries: response.FailedEntries || [],
              };
    } catch (err) {
      return { error: 'Failed to remove targets from an EventBridge rule', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
