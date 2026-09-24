import { tool } from 'ai';
import { z } from 'zod';
import { CreateBackendEnvironmentCommand } from '@aws-sdk/client-amplify';
import { createAmplifyClient } from '../client.js';

export const awsCreateAmplifyBackendEnvironment = tool({
  description: 'Creates a new backend environment for an Amplify app. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    appId: z.string().describe('The unique ID for an Amplify app'),
    environmentName: z.string().describe('The name of the backend environment'),
    stackName: z.string().optional().describe('The AWS CloudFormation stack name of a backend environment'),
    deploymentArtifacts: z.string().optional().describe('The name of deployment artifacts'),
  }),
  execute: async ({ awsCredentials, region, appId, environmentName, stackName, deploymentArtifacts }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAmplifyClient(awsCredentials, region);

      const command = new CreateBackendEnvironmentCommand({
          appId: appId,
          environmentName: environmentName,
          stackName: stackName,
          deploymentArtifacts: deploymentArtifacts,
      });
      const response = await client.send(command);
      return {
                  backendEnvironment: response.backendEnvironment,
              };
    } catch (err) {
      return { error: 'Failed to creates a new backend environment for an Amplify app', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
