import { tool } from 'ai';
import { z } from 'zod';
import { ListApplicationsCommand } from '@aws-sdk/client-codedeploy';
import { createCodeDeployClient } from '../client.js';

export const awsListCodedeployApplications = tool({
  description: 'List all CodeDeploy applications. Use it to inspect current state before making changes.',
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
      const client = createCodeDeployClient(awsCredentials, region);

      const command = new ListApplicationsCommand({
          nextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  applications: response.applications || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all CodeDeploy applications', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
