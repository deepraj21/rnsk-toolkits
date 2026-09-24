import { tool } from 'ai';
import { z } from 'zod';
import { StopDeploymentCommand } from '@aws-sdk/client-codedeploy';
import { createCodeDeployClient } from '../client.js';

export const awsStopCodedeployDeployment = tool({
  description: 'Stop a deployment. Use it to stop a running resource (billable config may remain).',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    deploymentId: z.string().describe('The unique ID of a deployment'),
    autoRollbackEnabled: z.boolean().optional().describe('Whether to enable auto rollback'),
  }),
  execute: async ({ awsCredentials, region, deploymentId, autoRollbackEnabled }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeDeployClient(awsCredentials, region);

      const command = new StopDeploymentCommand({
          deploymentId: deploymentId,
          autoRollbackEnabled: autoRollbackEnabled,
      });
      const response = await client.send(command);
      return {
                  status: response.status,
                  statusMessage: response.statusMessage,
              };
    } catch (err) {
      return { error: 'Failed to stop a deployment', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
