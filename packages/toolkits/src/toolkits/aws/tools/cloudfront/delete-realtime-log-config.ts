import { tool } from 'ai';
import { z } from 'zod';
import { DeleteRealtimeLogConfigCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsDeleteCloudfrontRealtimeLogConfig = tool({
  description: 'Delete a CloudFront real-time log config. Use it to permanently remove the resource.',
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

      const command = new DeleteRealtimeLogConfigCommand({
          Name: name,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Realtime log config ${name} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete a CloudFront real-time log config', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
