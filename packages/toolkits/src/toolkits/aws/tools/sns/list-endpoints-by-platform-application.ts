import { tool } from 'ai';
import { z } from 'zod';
import { ListEndpointsByPlatformApplicationCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsListSnsEndpointsByPlatformApplication = tool({
  description: 'List endpoints for a platform application. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    platformApplicationArn: z.string().describe('The ARN of the platform application'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, platformApplicationArn, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSnsClient(awsCredentials, region);

      const command = new ListEndpointsByPlatformApplicationCommand({
          PlatformApplicationArn: platformApplicationArn,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  endpoints: response.Endpoints || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list endpoints for a platform application', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
