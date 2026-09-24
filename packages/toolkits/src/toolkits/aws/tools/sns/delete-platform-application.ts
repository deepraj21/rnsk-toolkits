import { tool } from 'ai';
import { z } from 'zod';
import { DeletePlatformApplicationCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsDeleteSnsPlatformApplication = tool({
  description: 'Delete a platform application. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    platformApplicationArn: z.string().describe('The ARN of the platform application'),
  }),
  execute: async ({ awsCredentials, region, platformApplicationArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSnsClient(awsCredentials, region);

      const command = new DeletePlatformApplicationCommand({
          PlatformApplicationArn: platformApplicationArn,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Platform application ${platformApplicationArn} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete a platform application', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
