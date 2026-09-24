import { tool } from 'ai';
import { z } from 'zod';
import { CreateApplicationCommand } from '@aws-sdk/client-codedeploy';
import { createCodeDeployClient } from '../client.js';

export const awsCreateCodedeployApplication = tool({
  description: 'Create a new CodeDeploy application. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    applicationName: z.string().describe('The name of the application'),
    computePlatform: z.enum(['Server', 'Lambda', 'ECS']).optional().describe('The destination platform type for the deployment'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply to the application'),
  }),
  execute: async ({ awsCredentials, region, applicationName, computePlatform, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeDeployClient(awsCredentials, region);

      const command = new CreateApplicationCommand({
          applicationName: applicationName,
          computePlatform: computePlatform,
          tags: tags,
      });
      const response = await client.send(command);
      return {
                  applicationId: response.applicationId,
              };
    } catch (err) {
      return { error: 'Failed to create a new CodeDeploy application', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
