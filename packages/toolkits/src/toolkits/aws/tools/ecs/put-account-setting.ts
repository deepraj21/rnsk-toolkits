import { tool } from 'ai';
import { z } from 'zod';
import { PutAccountSettingCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsPutEcsAccountSetting = tool({
  description: 'Update an account setting. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The setting name'),
    value: z.string().describe('The setting value'),
    principalArn: z.string().optional().describe('Principal ARN (optional)'),
  }),
  execute: async ({ awsCredentials, region, name, value, principalArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new PutAccountSettingCommand({
          name: name as any,
          value: value,
          principalArn: principalArn,
      });
      const response = await client.send(command);
      return {
                  setting: response.setting,
              };
    } catch (err) {
      return { error: 'Failed to update an account setting', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
