import { tool } from 'ai';
import { z } from 'zod';
import { ListTagsForResourceCommand } from '@aws-sdk/client-elasticache';
import { createElastiCacheClient } from '../client.js';

export const awsListTagsForResource = tool({
  description: 'List tags for an ElastiCache resource. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceName: z.string().describe('ARN of the resource'),
  }),
  execute: async ({ awsCredentials, region, resourceName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createElastiCacheClient(awsCredentials, region);

      const command = new ListTagsForResourceCommand({
          ResourceName: resourceName,
      });
      const response = await client.send(command);
      return response.TagList;
    } catch (err) {
      return { error: 'Failed to list tags for an ElastiCache resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
