import { tool } from 'ai';
import { z } from 'zod';
import { GetResponseHeadersPolicyCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsGetCloudfrontResponseHeadersPolicy = tool({
  description: 'Get information about a CloudFront response headers policy. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    id: z.string().describe('The response headers policy ID'),
  }),
  execute: async ({ awsCredentials, region, id }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new GetResponseHeadersPolicyCommand({
          Id: id,
      });
      const response = await client.send(command);
      return {
                  responseHeadersPolicy: response.ResponseHeadersPolicy,
                  eTag: response.ETag,
              };
    } catch (err) {
      return { error: 'Failed to get information about a CloudFront response headers policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
