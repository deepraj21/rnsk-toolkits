import { tool } from 'ai';
import { z } from 'zod';
import { UpdateResponseHeadersPolicyCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsUpdateCloudfrontResponseHeadersPolicy = tool({
  description: 'Update a CloudFront response headers policy. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    responseHeadersPolicyConfig: z.record(z.any()).describe('Response headers policy configuration'),
    id: z.string().describe('The response headers policy ID'),
    ifMatch: z.string().describe('The value of the ETag header'),
  }),
  execute: async ({ awsCredentials, region, responseHeadersPolicyConfig, id, ifMatch }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new UpdateResponseHeadersPolicyCommand({
          ResponseHeadersPolicyConfig: responseHeadersPolicyConfig,
          Id: id,
          IfMatch: ifMatch,
      } as any);
      const response = await client.send(command);
      return {
                  responseHeadersPolicy: response.ResponseHeadersPolicy,
                  eTag: response.ETag,
              };
    } catch (err) {
      return { error: 'Failed to update a CloudFront response headers policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
