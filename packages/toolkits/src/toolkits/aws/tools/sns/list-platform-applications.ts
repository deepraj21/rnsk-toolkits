import { tool } from 'ai';
import { z } from 'zod';
import { ListPlatformApplicationsCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsListSnsPlatformApplications = tool({
  description: 'List all platform applications. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSnsClient(awsCredentials, region);

      const command = new ListPlatformApplicationsCommand({
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  platformApplications: response.PlatformApplications || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all platform applications', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
