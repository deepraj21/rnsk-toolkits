import { tool } from 'ai';
import { z } from 'zod';
import { CreatePlatformApplicationCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsCreateSnsPlatformApplication = tool({
  description: 'Create a platform application for push notifications. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The name of the platform application'),
    platform: z.enum(['APNS', 'APNS_SANDBOX', 'GCM', 'ADM', 'Baidu', 'WNS', 'MPNS']).describe('The platform (APNS, APNS_SANDBOX, GCM, ADM, Baidu, WNS, MPNS)'),
    attributes: z.record(z.any()).describe('Platform application attributes (PlatformCredential, PlatformPrincipal, etc.)'),
  }),
  execute: async ({ awsCredentials, region, name, platform, attributes }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSnsClient(awsCredentials, region);

      const command = new CreatePlatformApplicationCommand({
          Name: name,
          Platform: platform,
          Attributes: attributes,
      });
      const response = await client.send(command);
      return {
                  platformApplicationArn: response.PlatformApplicationArn,
              };
    } catch (err) {
      return { error: 'Failed to create a platform application for push notifications', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
