import { tool } from 'ai';
import { z } from 'zod';
import { UpdateApplicationCommand } from '@aws-sdk/client-codedeploy';
import { createCodeDeployClient } from '../client.js';

export const awsUpdateCodedeployApplication = tool({
  description: 'Update a CodeDeploy application. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    applicationName: z.string().describe('The name of the application'),
    newApplicationName: z.string().optional().describe('The new name for the application'),
  }),
  execute: async ({ awsCredentials, region, applicationName, newApplicationName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeDeployClient(awsCredentials, region);

      const command = new UpdateApplicationCommand({
          applicationName: applicationName,
          newApplicationName: newApplicationName,
      });
      await client.send(command);
      return {
                  message: 'Application updated successfully',
                  applicationName: newApplicationName || applicationName,
              };
    } catch (err) {
      return { error: 'Failed to update a CodeDeploy application', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
