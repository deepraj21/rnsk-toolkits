import { tool } from 'ai';
import { z } from 'zod';
import { UntagResourceCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsUntagLambdaFunction = tool({
  description: 'Remove tags from a Lambda function. Use it to remove tags from the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resource: z.string().describe('Function ARN'),
    tagKeys: z.array(z.string()).describe('Array of tag keys to remove'),
  }),
  execute: async ({ awsCredentials, region, resource, tagKeys }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new UntagResourceCommand({
          Resource: resource,
          TagKeys: tagKeys,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Tags removed successfully from resource ${resource}`,
              };
    } catch (err) {
      return { error: 'Failed to remove tags from a Lambda function', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
