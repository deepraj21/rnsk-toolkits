import { tool } from 'ai';
import { z } from 'zod';
import { CreateOrUpdateTagsCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsCreateOrUpdateAutoscalingTags = tool({
  description: 'Create or update tags for Auto Scaling resources. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    tags: z.array(z.record(z.any())).describe('Tags to create or update'),
  }),
  execute: async ({ awsCredentials, region, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new CreateOrUpdateTagsCommand({
          Tags: tags,
      } as any);
      await client.send(command);
      return {
                  success: true,
                  message: `Tags created/updated successfully`,
              };
    } catch (err) {
      return { error: 'Failed to create or update tags for Auto Scaling resources', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
