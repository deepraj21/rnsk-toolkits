import { tool } from 'ai';
import { z } from 'zod';
import { UntagResourceCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsUntagEksResource = tool({
  description: 'Remove tags from an EKS resource. Use it to remove tags from the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('The ARN of the resource'),
    tagKeys: z.array(z.string()).describe('List of tag keys to remove'),
  }),
  execute: async ({ awsCredentials, region, resourceArn, tagKeys }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new UntagResourceCommand({
          resourceArn: resourceArn,
          tagKeys: tagKeys,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Tags removed successfully from resource ${resourceArn}`,
              };
    } catch (err) {
      return { error: 'Failed to remove tags from an EKS resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
