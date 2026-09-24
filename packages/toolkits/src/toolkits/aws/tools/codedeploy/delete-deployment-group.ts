import { tool } from 'ai';
import { z } from 'zod';
import { DeleteDeploymentGroupCommand } from '@aws-sdk/client-codedeploy';
import { createCodeDeployClient } from '../client.js';

export const awsDeleteCodedeployDeploymentGroup = tool({
  description: 'Delete a deployment group. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    applicationName: z.string().describe('The name of the application'),
    deploymentGroupName: z.string().describe('The name of the deployment group to delete'),
  }),
  execute: async ({ awsCredentials, region, applicationName, deploymentGroupName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeDeployClient(awsCredentials, region);

      const command = new DeleteDeploymentGroupCommand({
          applicationName: applicationName,
          deploymentGroupName: deploymentGroupName,
      });
      await client.send(command);
      return {
                  message: 'Deployment group deleted successfully',
                  applicationName: applicationName,
                  deploymentGroupName: deploymentGroupName,
              };
    } catch (err) {
      return { error: 'Failed to delete a deployment group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
