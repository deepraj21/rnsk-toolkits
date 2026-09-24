import { tool } from 'ai';
import { z } from 'zod';
import { GetDeploymentCommand } from '@aws-sdk/client-codedeploy';
import { createCodeDeployClient } from '../client.js';

export const awsGetCodedeployDeployment = tool({
  description: 'Get details about a deployment. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    deploymentId: z.string().describe('The unique ID of a deployment'),
  }),
  execute: async ({ awsCredentials, region, deploymentId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeDeployClient(awsCredentials, region);

      const command = new GetDeploymentCommand({
          deploymentId: deploymentId,
      });
      const response = await client.send(command);
      return {
                  deploymentInfo: response.deploymentInfo,
              };
    } catch (err) {
      return { error: 'Failed to get details about a deployment', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
