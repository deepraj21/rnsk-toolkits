import { tool } from 'ai';
import { z } from 'zod';
import { DeleteAccountSettingCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsDeleteEcsAccountSetting = tool({
  description: 'Delete an account setting. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The setting name'),
    principalArn: z.string().optional().describe('Principal ARN (optional)'),
  }),
  execute: async ({ awsCredentials, region, name, principalArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new DeleteAccountSettingCommand({
          name: name as any,
          principalArn: principalArn,
      });
      const response = await client.send(command);
      return {
                  setting: response.setting,
              };
    } catch (err) {
      return { error: 'Failed to delete an account setting', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
