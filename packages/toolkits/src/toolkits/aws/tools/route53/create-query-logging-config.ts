import { tool } from 'ai';
import { z } from 'zod';
import { CreateQueryLoggingConfigCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsCreateRoute53QueryLoggingConfig = tool({
  description: 'Create a query logging configuration. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    hostedZoneId: z.string().describe('The hosted zone ID'),
    cloudWatchLogsLogGroupArn: z.string().describe('CloudWatch Logs log group ARN'),
  }),
  execute: async ({ awsCredentials, region, hostedZoneId, cloudWatchLogsLogGroupArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new CreateQueryLoggingConfigCommand({
          HostedZoneId: hostedZoneId,
          CloudWatchLogsLogGroupArn: cloudWatchLogsLogGroupArn,
      });
      const response = await client.send(command);
      return {
                  queryLoggingConfig: response.QueryLoggingConfig,
                  location: response.Location,
              };
    } catch (err) {
      return { error: 'Failed to create a query logging configuration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
