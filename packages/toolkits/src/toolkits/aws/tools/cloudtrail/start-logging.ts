import { tool } from 'ai';
import { z } from 'zod';
import { StartLoggingCommand } from '@aws-sdk/client-cloudtrail';
import { createCloudTrailClient } from '../client.js';

export const awsStartLogging = tool({
  description: 'Starts the recording of AWS API calls and log file delivery for a trail. Use it to start a stopped resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The name of the trail'),
  }),
  execute: async ({ awsCredentials, region, name }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudTrailClient(awsCredentials, region);

      const command = new StartLoggingCommand({
          Name: name,
      });
      await client.send(command);
      return {
                  success: true,
              };
    } catch (err) {
      return { error: 'Failed to starts the recording of AWS API calls and log file delivery for a trail', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
