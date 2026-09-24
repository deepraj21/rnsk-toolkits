import { tool } from 'ai';
import { z } from 'zod';
import { ListDeploymentGroupsCommand } from '@aws-sdk/client-codedeploy';
import { createCodeDeployClient } from '../client.js';

export const awsListCodedeployDeploymentGroups = tool({
  description: 'List deployment groups for an application. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    applicationName: z.string().describe('The name of the application'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, applicationName, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeDeployClient(awsCredentials, region);

      const command = new ListDeploymentGroupsCommand({
          applicationName: applicationName,
          nextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  deploymentGroups: response.deploymentGroups || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list deployment groups for an application', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
