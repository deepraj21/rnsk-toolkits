import { tool } from 'ai';
import { z } from 'zod';
import { ContinueDeploymentCommand } from '@aws-sdk/client-codedeploy';
import { createCodeDeployClient } from '../client.js';

export const awsContinueCodedeployDeployment = tool({
  description: 'Continue a stopped deployment. Use it to resume a deployment.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    deploymentId: z.string().describe('The unique ID of a deployment'),
    deploymentWaitType: z.enum(['READY_WAIT', 'TERMINATION_WAIT']).optional().describe('The deployment wait type'),
  }),
  execute: async ({ awsCredentials, region, deploymentId, deploymentWaitType }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeDeployClient(awsCredentials, region);

      const command = new ContinueDeploymentCommand({
          deploymentId: deploymentId,
          deploymentWaitType: deploymentWaitType as any,
      });
      await client.send(command);
      return {
                  message: 'Deployment continued successfully',
                  deploymentId: deploymentId,
              };
    } catch (err) {
      return { error: 'Failed to continue a stopped deployment', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
