import { tool } from 'ai';
import { z } from 'zod';
import { GetRealtimeLogConfigCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsGetCloudfrontRealtimeLogConfig = tool({
  description: 'Get information about a CloudFront real-time log config. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The real-time log config name'),
  }),
  execute: async ({ awsCredentials, region, name }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new GetRealtimeLogConfigCommand({
          Name: name,
      });
      const response = await client.send(command);
      return {
                  realtimeLogConfig: response.RealtimeLogConfig,
              };
    } catch (err) {
      return { error: 'Failed to get information about a CloudFront real-time log config', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
