import { tool } from 'ai';
import { z } from 'zod';
import { CreateResponseHeadersPolicyCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsCreateCloudfrontResponseHeadersPolicy = tool({
  description: 'Create a CloudFront response headers policy. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    responseHeadersPolicyConfig: z.record(z.any()).describe('Response headers policy configuration'),
  }),
  execute: async ({ awsCredentials, region, responseHeadersPolicyConfig }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new CreateResponseHeadersPolicyCommand({
          ResponseHeadersPolicyConfig: responseHeadersPolicyConfig,
      } as any);
      const response = await client.send(command);
      return {
                  responseHeadersPolicy: response.ResponseHeadersPolicy,
                  location: response.Location,
                  eTag: response.ETag,
              };
    } catch (err) {
      return { error: 'Failed to create a CloudFront response headers policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
