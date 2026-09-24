import { tool } from 'ai';
import { z } from 'zod';
import { DeleteApplicationCommand } from '@aws-sdk/client-codedeploy';
import { createCodeDeployClient } from '../client.js';

export const awsDeleteCodedeployApplication = tool({
  description: 'Delete a CodeDeploy application. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    applicationName: z.string().describe('The name of the application to delete'),
  }),
  execute: async ({ awsCredentials, region, applicationName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeDeployClient(awsCredentials, region);

      const command = new DeleteApplicationCommand({
          applicationName: applicationName,
      });
      await client.send(command);
      return {
                  message: 'Application deleted successfully',
                  applicationName: applicationName,
              };
    } catch (err) {
      return { error: 'Failed to delete a CodeDeploy application', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
