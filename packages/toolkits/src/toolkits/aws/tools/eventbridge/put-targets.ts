import { tool } from 'ai';
import { z } from 'zod';
import { PutTargetsCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsPutEventbridgeTargets = tool({
  description: 'Add or update targets for an EventBridge rule. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    rule: z.string().describe('Name of the rule'),
    targets: z.array(z.record(z.any())).describe('Target ID'),
    eventBusName: z.string().optional().describe('Event bus name'),
  }),
  execute: async ({ awsCredentials, region, rule, targets, eventBusName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEventBridgeClient(awsCredentials, region);

      const command = new PutTargetsCommand({
          Rule: rule,
          Targets: targets,
          EventBusName: eventBusName,
      } as any);
      const response = await client.send(command);
      return {
                  failedEntryCount: response.FailedEntryCount,
                  failedEntries: response.FailedEntries || [],
              };
    } catch (err) {
      return { error: 'Failed to add or update targets for an EventBridge rule', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
