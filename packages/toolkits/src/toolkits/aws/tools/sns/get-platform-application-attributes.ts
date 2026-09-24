import { tool } from 'ai';
import { z } from 'zod';
import { GetPlatformApplicationAttributesCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsGetSnsPlatformApplicationAttributes = tool({
  description: 'Get attributes of a platform application. Use it to inspect current state before making changes.',
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

      const command = new GetPlatformApplicationAttributesCommand({
          PlatformApplicationArn: platformApplicationArn,
      });
      const response = await client.send(command);
      return {
                  attributes: response.Attributes || {},
              };
    } catch (err) {
      return { error: 'Failed to get attributes of a platform application', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
