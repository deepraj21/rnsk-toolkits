import { tool } from 'ai';
import { z } from 'zod';
import { AddTagsToResourceCommand } from '@aws-sdk/client-elasticache';
import { createElastiCacheClient } from '../client.js';

export const awsAddTagsToResource = tool({
  description: 'Add tags to an ElastiCache resource. Use it to grant access or attach configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceName: z.string().describe('ARN of the resource'),
    tags: z.array(z.record(z.any())).describe('Tags to add'),
    properties: z.string().optional().describe('properties'),
    Key: z.string().optional().describe('Key'),
    Value: z.string().optional().describe('Value'),
  }),
  execute: async ({ awsCredentials, region, resourceName, tags, properties, Key, Value }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createElastiCacheClient(awsCredentials, region);

      const command = new AddTagsToResourceCommand({
          ResourceName: resourceName,
          Tags: tags,
      });
      const response = await client.send(command);
      return response.TagList;
    } catch (err) {
      return { error: 'Failed to add tags to an ElastiCache resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
