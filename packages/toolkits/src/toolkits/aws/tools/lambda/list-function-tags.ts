import { tool } from 'ai';
import { z } from 'zod';
import { ListTagsCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsListLambdaFunctionTags = tool({
  description: 'List tags for a Lambda function. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resource: z.string().describe('Function ARN'),
  }),
  execute: async ({ awsCredentials, region, resource }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new ListTagsCommand({
          Resource: resource,
      });
      const response = await client.send(command);
      return {
                  tags: response.Tags || {},
              };
    } catch (err) {
      return { error: 'Failed to list tags for a Lambda function', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
