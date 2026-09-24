import { tool } from 'ai';
import { z } from 'zod';
import { CreateCloudFrontOriginAccessIdentityCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsCreateCloudfrontOriginAccessIdentity = tool({
  description: 'Create a CloudFront origin access identity. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    originAccessIdentityConfig: z.record(z.any()).describe('Origin access identity configuration'),
  }),
  execute: async ({ awsCredentials, region, originAccessIdentityConfig }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new CreateCloudFrontOriginAccessIdentityCommand({
          CloudFrontOriginAccessIdentityConfig: originAccessIdentityConfig,
      } as any);
      const response = await client.send(command);
      return {
                  cloudFrontOriginAccessIdentity: response.CloudFrontOriginAccessIdentity,
                  location: response.Location,
                  eTag: response.ETag,
              };
    } catch (err) {
      return { error: 'Failed to create a CloudFront origin access identity', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
