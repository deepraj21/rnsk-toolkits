import { tool } from 'ai';
import { z } from 'zod';
import { ListAccountSettingsCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsListEcsAccountSettings = tool({
  description: 'List account settings. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().optional().describe('Filter by setting name'),
    value: z.string().optional().describe('Filter by setting value'),
    principalArn: z.string().optional().describe('Filter by principal ARN'),
    effectiveSettings: z.boolean().optional().describe('Return effective settings'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of settings to return'),
  }),
  execute: async ({ awsCredentials, region, name, value, principalArn, effectiveSettings, nextToken, maxResults }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new ListAccountSettingsCommand({
          name: name as any,
          value: value,
          principalArn: principalArn,
          effectiveSettings: effectiveSettings,
          nextToken: nextToken,
          maxResults: maxResults,
      });
      const response = await client.send(command);
      return {
                  settings: response.settings || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list account settings', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
