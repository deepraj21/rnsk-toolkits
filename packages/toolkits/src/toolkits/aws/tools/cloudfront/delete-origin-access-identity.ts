import { tool } from 'ai';
import { z } from 'zod';
import { DeleteCloudFrontOriginAccessIdentityCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsDeleteCloudfrontOriginAccessIdentity = tool({
  description: 'Delete a CloudFront origin access identity. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    id: z.string().describe('The origin access identity ID'),
    ifMatch: z.string().describe('The value of the ETag header'),
  }),
  execute: async ({ awsCredentials, region, id, ifMatch }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new DeleteCloudFrontOriginAccessIdentityCommand({
          Id: id,
          IfMatch: ifMatch,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Origin access identity ${id} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete a CloudFront origin access identity', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
