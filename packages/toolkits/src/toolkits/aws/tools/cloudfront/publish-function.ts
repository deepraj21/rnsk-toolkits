import { tool } from 'ai';
import { z } from 'zod';
import { PublishFunctionCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsPublishCloudfrontFunction = tool({
  description: 'Publish a CloudFront function. Use it to publish or release.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The function name'),
    ifMatch: z.string().describe('The value of the ETag header'),
  }),
  execute: async ({ awsCredentials, region, name, ifMatch }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new PublishFunctionCommand({
          Name: name,
          IfMatch: ifMatch,
      });
      const response = await client.send(command);
      return {
                  functionSummary: response.FunctionSummary,
              };
    } catch (err) {
      return { error: 'Failed to publish a CloudFront function', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
