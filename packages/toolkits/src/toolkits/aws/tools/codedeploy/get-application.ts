import { tool } from 'ai';
import { z } from 'zod';
import { GetApplicationCommand } from '@aws-sdk/client-codedeploy';
import { createCodeDeployClient } from '../client.js';

export const awsGetCodedeployApplication = tool({
  description: 'Get details about a CodeDeploy application. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    applicationName: z.string().describe('The name of the application'),
  }),
  execute: async ({ awsCredentials, region, applicationName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeDeployClient(awsCredentials, region);

      const command = new GetApplicationCommand({
          applicationName: applicationName,
      });
      const response = await client.send(command);
      return {
                  application: response.application,
              };
    } catch (err) {
      return { error: 'Failed to get details about a CodeDeploy application', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
