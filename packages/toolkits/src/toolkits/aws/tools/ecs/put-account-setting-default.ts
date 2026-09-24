import { tool } from 'ai';
import { z } from 'zod';
import { PutAccountSettingDefaultCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsPutEcsAccountSettingDefault = tool({
  description: 'Update the default account setting. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The setting name'),
    value: z.string().describe('The setting value'),
  }),
  execute: async ({ awsCredentials, region, name, value }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new PutAccountSettingDefaultCommand({
          name: name as any,
          value: value,
      });
      const response = await client.send(command);
      return {
                  setting: response.setting,
              };
    } catch (err) {
      return { error: 'Failed to update the default account setting', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
