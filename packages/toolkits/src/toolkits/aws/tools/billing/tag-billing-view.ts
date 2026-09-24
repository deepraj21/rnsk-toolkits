import { tool } from 'ai';
import { z } from 'zod';
import { TagResourceCommand } from '@aws-sdk/client-billing';
import { createBillingClient } from '../client.js';

export const awsTagBillingView = tool({
  description: 'Add tags to a billing view. Use it to label the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('The ARN of the billing view resource'),
    tags: z.record(z.any()).describe('Tags as key-value pairs'),
  }),
  execute: async ({ awsCredentials, region, resourceArn, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBillingClient(awsCredentials, region);

      const command = new TagResourceCommand({
          resourceArn: resourceArn,
          tags: tags,
      } as any);
      const response = await client.send(command) as any;
      return {
                  success: true,
              };
    } catch (err) {
      return { error: 'Failed to add tags to a billing view', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
