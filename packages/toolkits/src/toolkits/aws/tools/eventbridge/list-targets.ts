import { tool } from 'ai';
import { z } from 'zod';
import { ListTargetsByRuleCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsListEventbridgeTargets = tool({
  description: 'List targets for an EventBridge rule. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    rule: z.string().describe('Name of the rule'),
    eventBusName: z.string().optional().describe('Event bus name'),
    nextToken: z.string().optional().describe('Token for pagination'),
    limit: z.number().optional().describe('Maximum number of targets to return'),
  }),
  execute: async ({ awsCredentials, region, rule, eventBusName, nextToken, limit }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEventBridgeClient(awsCredentials, region);

      const command = new ListTargetsByRuleCommand({
          Rule: rule,
          EventBusName: eventBusName,
          NextToken: nextToken,
          Limit: limit,
      });
      const response = await client.send(command);
      return {
                  targets: response.Targets || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list targets for an EventBridge rule', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
