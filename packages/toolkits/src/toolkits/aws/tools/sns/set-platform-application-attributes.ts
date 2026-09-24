import { tool } from 'ai';
import { z } from 'zod';
import { SetPlatformApplicationAttributesCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsSetSnsPlatformApplicationAttributes = tool({
  description: 'Set attributes of a platform application. Use it to change the configuration of the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    platformApplicationArn: z.string().describe('The ARN of the platform application'),
    attributes: z.record(z.any()).describe('Attributes to set'),
  }),
  execute: async ({ awsCredentials, region, platformApplicationArn, attributes }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSnsClient(awsCredentials, region);

      const command = new SetPlatformApplicationAttributesCommand({
          PlatformApplicationArn: platformApplicationArn,
          Attributes: attributes,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Attributes set successfully for platform application ${platformApplicationArn}`,
              };
    } catch (err) {
      return { error: 'Failed to set attributes of a platform application', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
