import { tool } from 'ai';
import { z } from 'zod';
import { CreateMonitoringSubscriptionCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsCreateCloudfrontMonitoringSubscription = tool({
  description: 'Create monitoring subscription for a CloudFront distribution. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    distributionId: z.string().describe('The distribution ID'),
    monitoringSubscription: z.record(z.any()).describe('Monitoring subscription configuration'),
  }),
  execute: async ({ awsCredentials, region, distributionId, monitoringSubscription }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new CreateMonitoringSubscriptionCommand({
          DistributionId: distributionId,
          MonitoringSubscription: monitoringSubscription,
      });
      const response = await client.send(command);
      return {
                  monitoringSubscription: response.MonitoringSubscription,
              };
    } catch (err) {
      return { error: 'Failed to create monitoring subscription for a CloudFront distribution', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
