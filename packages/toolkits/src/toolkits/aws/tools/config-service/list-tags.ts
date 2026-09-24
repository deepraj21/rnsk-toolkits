import { tool } from 'ai';
import { z } from 'zod';
import { ListTagsForResourceCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsListConfigTags = tool({
  description: 'List tags for a Config resource. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('The ARN of the resource'),
    limit: z.number().optional().describe('Maximum number of tags to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, resourceArn, limit, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new ListTagsForResourceCommand({
          ResourceArn: resourceArn,
          Limit: limit,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  tags: response.Tags || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list tags for a Config resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
