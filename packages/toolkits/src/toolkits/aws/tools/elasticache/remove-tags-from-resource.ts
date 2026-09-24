import { tool } from 'ai';
import { z } from 'zod';
import { RemoveTagsFromResourceCommand } from '@aws-sdk/client-elasticache';
import { createElastiCacheClient } from '../client.js';

export const awsRemoveTagsFromResource = tool({
  description: 'Remove tags from an ElastiCache resource. Use it to remove access or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceName: z.string().describe('ARN of the resource'),
    tagKeys: z.array(z.string()).describe('Tag keys to remove'),
  }),
  execute: async ({ awsCredentials, region, resourceName, tagKeys }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createElastiCacheClient(awsCredentials, region);

      const command = new RemoveTagsFromResourceCommand({
          ResourceName: resourceName,
          TagKeys: tagKeys,
      });
      const response = await client.send(command);
      return response.TagList;
    } catch (err) {
      return { error: 'Failed to remove tags from an ElastiCache resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
