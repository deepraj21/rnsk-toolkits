import { tool } from 'ai';
import { z } from 'zod';
import { GetMonitoringSubscriptionCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsGetCloudfrontMonitoringSubscription = tool({
  description: 'Get monitoring subscription for a CloudFront distribution. Use it to inspect current state before making changes.',
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

      const command = new GetMonitoringSubscriptionCommand({
          DistributionId: distributionId,
      });
      const response = await client.send(command);
      return {
                  monitoringSubscription: response.MonitoringSubscription,
              };
    } catch (err) {
      return { error: 'Failed to get monitoring subscription for a CloudFront distribution', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
