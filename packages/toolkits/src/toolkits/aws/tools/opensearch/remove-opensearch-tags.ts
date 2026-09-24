import { tool } from 'ai';
import { z } from 'zod';
import { RemoveTagsCommand } from '@aws-sdk/client-opensearch';
import { createOpenSearchClient } from '../client.js';

export const awsRemoveOpensearchTags = tool({
  description: 'Remove tags from an OpenSearch domain. Use it to remove access or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    arn: z.string().describe('ARN of the OpenSearch domain'),
    tagKeys: z.array(z.string()).describe('Tag keys to remove'),
  }),
  execute: async ({ awsCredentials, region, arn, tagKeys }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createOpenSearchClient(awsCredentials, region);

      const command = new RemoveTagsCommand({
          ARN: arn,
          TagKeys: tagKeys,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to remove tags from an OpenSearch domain', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
