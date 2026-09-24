import { tool } from 'ai';
import { z } from 'zod';
import { ListRulesCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsListEventbridgeRules = tool({
  description: 'List EventBridge rules. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    namePrefix: z.string().optional().describe('Filter by name prefix'),
    eventBusName: z.string().optional().describe('Event bus name'),
    nextToken: z.string().optional().describe('Token for pagination'),
    limit: z.number().optional().describe('Maximum number of rules to return'),
  }),
  execute: async ({ awsCredentials, region, namePrefix, eventBusName, nextToken, limit }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEventBridgeClient(awsCredentials, region);

      const command = new ListRulesCommand({
          NamePrefix: namePrefix,
          EventBusName: eventBusName,
          NextToken: nextToken,
          Limit: limit,
      });
      const response = await client.send(command);
      return {
                  rules: response.Rules || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list EventBridge rules', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
