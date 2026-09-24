import { tool } from 'ai';
import { z } from 'zod';
import { ListTagsForResourceCommand } from '@aws-sdk/client-batch';
import { createBatchClient } from '../client.js';

export const awsListBatchTags = tool({
  description: 'List tags for a Batch resource. Use it to inspect current state before making changes.',
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
      const client = createBatchClient(awsCredentials, region);

      const command = new ListTagsForResourceCommand({
          resourceArn: resourceArn,
      });
      const response = await client.send(command);
      return {
                  tags: response.tags || {},
              };
    } catch (err) {
      return { error: 'Failed to list tags for a Batch resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
