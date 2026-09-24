import { tool } from 'ai';
import { z } from 'zod';
import { TagResourceCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsTagLambdaFunction = tool({
  description: 'Add tags to a Lambda function. Use it to label the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resource: z.string().describe('Function ARN'),
    tags: z.record(z.any()).describe('Tags as key-value pairs'),
  }),
  execute: async ({ awsCredentials, region, resource, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new TagResourceCommand({
          Resource: resource,
          Tags: tags,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Tags added successfully to resource ${resource}`,
              };
    } catch (err) {
      return { error: 'Failed to add tags to a Lambda function', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
