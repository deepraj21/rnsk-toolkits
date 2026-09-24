import { tool } from 'ai';
import { z } from 'zod';
import { ListTagsCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsListSagemakerTags = tool({
  description: 'List tags for a SageMaker resource. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('ARN of the resource'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, resourceArn, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new ListTagsCommand({
          ResourceArn: resourceArn,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  tags: response.Tags || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list tags for a SageMaker resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
