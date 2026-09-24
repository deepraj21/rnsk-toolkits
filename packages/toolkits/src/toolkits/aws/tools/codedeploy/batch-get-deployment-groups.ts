import { tool } from 'ai';
import { z } from 'zod';
import { BatchGetDeploymentGroupsCommand } from '@aws-sdk/client-codedeploy';
import { createCodeDeployClient } from '../client.js';

export const awsBatchGetCodedeployDeploymentGroups = tool({
  description: 'Get information about one or more deployment groups. Use it to operate on multiple resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    applicationName: z.string().describe('The name of the application'),
    deploymentGroupNames: z.array(z.string()).describe('The names of the deployment groups'),
  }),
  execute: async ({ awsCredentials, region, applicationName, deploymentGroupNames }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeDeployClient(awsCredentials, region);

      const command = new BatchGetDeploymentGroupsCommand({
          applicationName: applicationName,
          deploymentGroupNames: deploymentGroupNames,
      });
      const response = await client.send(command);
      return {
                  deploymentGroupsInfo: response.deploymentGroupsInfo || [],
                  errorMessage: response.errorMessage,
              };
    } catch (err) {
      return { error: 'Failed to get information about one or more deployment groups', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
