import { tool } from 'ai';
import { z } from 'zod';
import { CreatePlatformEndpointCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsCreateSnsPlatformEndpoint = tool({
  description: 'Create a platform endpoint for push notifications. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    platformApplicationArn: z.string().describe('The ARN of the platform application'),
    token: z.string().describe('Device token'),
    customUserData: z.string().optional().describe('Custom user data'),
    attributes: z.record(z.any()).optional().describe('Endpoint attributes'),
  }),
  execute: async ({ awsCredentials, region, platformApplicationArn, token, customUserData, attributes }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSnsClient(awsCredentials, region);

      const command = new CreatePlatformEndpointCommand({
          PlatformApplicationArn: platformApplicationArn,
          Token: token,
          CustomUserData: customUserData,
          Attributes: attributes,
      });
      const response = await client.send(command);
      return {
                  endpointArn: response.EndpointArn,
              };
    } catch (err) {
      return { error: 'Failed to create a platform endpoint for push notifications', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
