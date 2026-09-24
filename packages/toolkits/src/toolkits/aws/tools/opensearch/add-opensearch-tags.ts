import { tool } from 'ai';
import { z } from 'zod';
import { AddTagsCommand } from '@aws-sdk/client-opensearch';
import { createOpenSearchClient } from '../client.js';

export const awsAddOpensearchTags = tool({
  description: 'Add tags to an OpenSearch domain. Use it to grant access or attach configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    arn: z.string().describe('ARN of the OpenSearch domain'),
    tagList: z.array(z.record(z.any())).describe('Tags to add'),
  }),
  execute: async ({ awsCredentials, region, arn, tagList }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createOpenSearchClient(awsCredentials, region);

      const command = new AddTagsCommand({
          ARN: arn,
          TagList: tagList,
      } as any);
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to add tags to an OpenSearch domain', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
