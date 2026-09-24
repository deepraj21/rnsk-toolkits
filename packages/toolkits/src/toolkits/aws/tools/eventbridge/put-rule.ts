import { tool } from 'ai';
import { z } from 'zod';
import { PutRuleCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsPutEventbridgeRule = tool({
  description: 'Create or update an EventBridge rule. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('Name of the rule'),
    eventPattern: z.string().optional().describe('Event pattern (JSON string)'),
    scheduleExpression: z.string().optional().describe('Schedule expression (cron or rate)'),
    state: z.enum(['ENABLED', 'DISABLED']).optional().describe('Rule state'),
    description: z.string().optional().describe('Rule description'),
    roleArn: z.string().optional().describe('IAM role ARN'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
    eventBusName: z.string().optional().describe('Event bus name'),
  }),
  execute: async ({ awsCredentials, region, name, eventPattern, scheduleExpression, state, description, roleArn, tags, eventBusName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEventBridgeClient(awsCredentials, region);

      const command = new PutRuleCommand({
          Name: name,
          EventPattern: eventPattern,
          ScheduleExpression: scheduleExpression,
          State: state,
          Description: description,
          RoleArn: roleArn,
          Tags: tags,
          EventBusName: eventBusName,
      } as any);
      const response = await client.send(command);
      return {
                  ruleArn: response.RuleArn,
              };
    } catch (err) {
      return { error: 'Failed to create or update an EventBridge rule', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
