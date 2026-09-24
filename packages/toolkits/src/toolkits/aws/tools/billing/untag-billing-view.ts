import { tool } from 'ai';
import { z } from 'zod';
import { UntagResourceCommand } from '@aws-sdk/client-billing';
import { createBillingClient } from '../client.js';

export const awsUntagBillingView = tool({
  description: 'Remove tags from a billing view. Use it to remove tags from the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('The ARN of the billing view resource'),
    tagKeys: z.array(z.string()).describe('Array of tag keys to remove'),
  }),
  execute: async ({ awsCredentials, region, resourceArn, tagKeys }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBillingClient(awsCredentials, region);

      const command = new UntagResourceCommand({
          resourceArn: resourceArn,
          tagKeys: tagKeys,
      } as any);
      const response = await client.send(command) as any;
      return {
                  success: true,
              };
    } catch (err) {
      return { error: 'Failed to remove tags from a billing view', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
