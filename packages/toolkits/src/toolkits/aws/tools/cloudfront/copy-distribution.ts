import { tool } from 'ai';
import { z } from 'zod';
import { CopyDistributionCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsCopyCloudfrontDistribution = tool({
  description: 'Copy a CloudFront distribution. Use it to duplicate data.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    primaryDistributionId: z.string().describe('The primary distribution ID'),
    staging: z.boolean().describe('Whether to copy to staging'),
    ifMatch: z.string().describe('The value of the ETag header'),
    callerReference: z.string().describe('Unique caller reference'),
  }),
  execute: async ({ awsCredentials, region, primaryDistributionId, staging, ifMatch, callerReference }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new CopyDistributionCommand({
          PrimaryDistributionId: primaryDistributionId,
          Staging: staging,
          IfMatch: ifMatch,
          CallerReference: callerReference,
      });
      const response = await client.send(command);
      return {
                  distribution: response.Distribution,
                  location: response.Location,
                  eTag: response.ETag,
              };
    } catch (err) {
      return { error: 'Failed to copy a CloudFront distribution', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
