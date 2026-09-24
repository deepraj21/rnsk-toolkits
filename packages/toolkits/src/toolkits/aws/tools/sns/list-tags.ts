import { tool } from 'ai';
import { z } from 'zod';
import { ListTagsForResourceCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsListSnsTags = tool({
  description: 'List tags for an SNS resource. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('The ARN of the resource'),
  }),
  execute: async ({ awsCredentials, region, resourceArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSnsClient(awsCredentials, region);

      const command = new ListTagsForResourceCommand({
          ResourceArn: resourceArn,
      });
      const response = await client.send(command);
      return {
                  tags: response.Tags || [],
              };
    } catch (err) {
      return { error: 'Failed to list tags for an SNS resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
