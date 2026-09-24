import { tool } from 'ai';
import { z } from 'zod';
import { DeleteMonitoringSubscriptionCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsDeleteCloudfrontMonitoringSubscription = tool({
  description: 'Delete monitoring subscription for a CloudFront distribution. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    distributionId: z.string().describe('The distribution ID'),
  }),
  execute: async ({ awsCredentials, region, distributionId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new DeleteMonitoringSubscriptionCommand({
          DistributionId: distributionId,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Monitoring subscription deleted successfully for distribution ${distributionId}`,
              };
    } catch (err) {
      return { error: 'Failed to delete monitoring subscription for a CloudFront distribution', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
