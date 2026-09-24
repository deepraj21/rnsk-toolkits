import { tool } from 'ai';
import { z } from 'zod';
import { TagResourceCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsTagSnsResource = tool({
  description: 'Add tags to an SNS resource. Use it to label the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('The ARN of the resource'),
    tags: z.array(z.record(z.any())).describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, resourceArn, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSnsClient(awsCredentials, region);

      const command = new TagResourceCommand({
          ResourceArn: resourceArn,
          Tags: tags as any,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Tags added successfully to resource ${resourceArn}`,
              };
    } catch (err) {
      return { error: 'Failed to add tags to an SNS resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
