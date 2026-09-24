import { tool } from 'ai';
import { z } from 'zod';
import { ListTagsCommand } from '@aws-sdk/client-opensearch';
import { createOpenSearchClient } from '../client.js';

export const awsListOpensearchTags = tool({
  description: 'List tags for an OpenSearch domain. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    arn: z.string().describe('ARN of the OpenSearch domain'),
  }),
  execute: async ({ awsCredentials, region, arn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createOpenSearchClient(awsCredentials, region);

      const command = new ListTagsCommand({
          ARN: arn,
      });
      const response = await client.send(command);
      return response.TagList;
    } catch (err) {
      return { error: 'Failed to list tags for an OpenSearch domain', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
