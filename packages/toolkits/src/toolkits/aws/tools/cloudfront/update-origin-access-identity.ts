import { tool } from 'ai';
import { z } from 'zod';
import { UpdateCloudFrontOriginAccessIdentityCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsUpdateCloudfrontOriginAccessIdentity = tool({
  description: 'Update a CloudFront origin access identity. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    originAccessIdentityConfig: z.record(z.any()).describe('Origin access identity configuration'),
    id: z.string().describe('The origin access identity ID'),
    ifMatch: z.string().describe('The value of the ETag header'),
  }),
  execute: async ({ awsCredentials, region, originAccessIdentityConfig, id, ifMatch }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new UpdateCloudFrontOriginAccessIdentityCommand({
          CloudFrontOriginAccessIdentityConfig: originAccessIdentityConfig,
          Id: id,
          IfMatch: ifMatch,
      } as any);
      const response = await client.send(command);
      return {
                  cloudFrontOriginAccessIdentity: response.CloudFrontOriginAccessIdentity,
                  eTag: response.ETag,
              };
    } catch (err) {
      return { error: 'Failed to update a CloudFront origin access identity', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
