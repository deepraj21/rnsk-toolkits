import { tool } from 'ai';
import { z } from 'zod';
import { GetDeploymentGroupCommand } from '@aws-sdk/client-codedeploy';
import { createCodeDeployClient } from '../client.js';

export const awsGetCodedeployDeploymentGroup = tool({
  description: 'Get details about a deployment group. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    applicationName: z.string().describe('The name of the application'),
    deploymentGroupName: z.string().describe('The name of the deployment group'),
  }),
  execute: async ({ awsCredentials, region, applicationName, deploymentGroupName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeDeployClient(awsCredentials, region);

      const command = new GetDeploymentGroupCommand({
          applicationName: applicationName,
          deploymentGroupName: deploymentGroupName,
      });
      const response = await client.send(command);
      return {
                  deploymentGroupInfo: response.deploymentGroupInfo,
              };
    } catch (err) {
      return { error: 'Failed to get details about a deployment group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
