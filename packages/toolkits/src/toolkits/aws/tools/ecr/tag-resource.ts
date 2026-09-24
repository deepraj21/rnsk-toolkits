import { tool } from 'ai';
import { z } from 'zod';
import { TagResourceCommand } from '@aws-sdk/client-ecr';
import { createEcrClient } from '../client.js';

export const awsTagEcrResource = tool({
  description: 'Add tags to an ECR resource. Use it to label the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('The ARN of the resource'),
    tags: z.array(z.record(z.any())).describe('Tags to apply to the resource'),
  }),
  execute: async ({ awsCredentials, region, resourceArn, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcrClient(awsCredentials, region);

      const command = new TagResourceCommand({
          resourceArn: resourceArn,
          tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  success: true,
              };
    } catch (err) {
      return { error: 'Failed to add tags to an ECR resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
