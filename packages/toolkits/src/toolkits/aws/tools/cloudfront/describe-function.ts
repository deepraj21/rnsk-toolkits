import { tool } from 'ai';
import { z } from 'zod';
import { DescribeFunctionCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsDescribeCloudfrontFunction = tool({
  description: 'Describe a CloudFront function. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The function name'),
  }),
  execute: async ({ awsCredentials, region, name }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new DescribeFunctionCommand({
          Name: name,
      });
      const response = await client.send(command);
      return {
                  eTag: response.ETag,
                  functionSummary: response.FunctionSummary,
              };
    } catch (err) {
      return { error: 'Failed to describe a CloudFront function', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
