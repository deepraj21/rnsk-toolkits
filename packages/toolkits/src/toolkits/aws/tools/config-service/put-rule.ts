import { tool } from 'ai';
import { z } from 'zod';
import { PutConfigRuleCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsPutConfigRule = tool({
  description: 'Adds or updates an Config rule to evaluate if your AWS resources comply with your desired configurations. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    configRule: z.enum(['CUSTOM_LAMBDA', 'AWS']).describe('Config rule configuration'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, configRule, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new PutConfigRuleCommand({
          ConfigRule: configRule,
          Tags: tags,
      } as any);
      await client.send(command);
      return {
                  message: 'Config rule created/updated successfully',
              };
    } catch (err) {
      return { error: 'Failed to adds or updates an Config rule to evaluate if your AWS resources comply with your desired configurations', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
