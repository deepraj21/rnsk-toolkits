import { tool } from 'ai';
import { z } from 'zod';
import { TagResourceCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsTagEksResource = tool({
  description: 'Add tags to an EKS resource. Use it to label the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('The ARN of the resource'),
    tags: z.record(z.any()).describe('Tags to apply to the resource'),
  }),
  execute: async ({ awsCredentials, region, resourceArn, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new TagResourceCommand({
          resourceArn: resourceArn,
          tags: tags,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Tags added successfully to resource ${resourceArn}`,
              };
    } catch (err) {
      return { error: 'Failed to add tags to an EKS resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
