import { tool } from 'ai';
import { z } from 'zod';
import { CreateDeploymentCommand } from '@aws-sdk/client-codedeploy';
import { createCodeDeployClient } from '../client.js';

export const awsCreateCodedeployDeployment = tool({
  description: 'Create a new deployment. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    applicationName: z.string().describe('The name of the application'),
    deploymentGroupName: z.string().describe('The name of the deployment group'),
    revision: z.enum(['S3', 'GitHub', 'String', 'AppSpecContent']).describe('The type and location of the revision to deploy'),
    deploymentConfigName: z.string().optional().describe('The deployment configuration name'),
    description: z.string().optional().describe('A comment about the deployment'),
    ignoreApplicationStopFailures: z.boolean().optional().describe('Whether to ignore application stop failures'),
    targetInstances: z.record(z.any()).optional().describe('Target instances'),
    autoRollbackConfiguration: z.record(z.any()).optional().describe('Auto rollback configuration'),
    updateOutdatedInstancesOnly: z.boolean().optional().describe('Whether to update outdated instances only'),
    fileExistsBehavior: z.enum(['DISALLOW', 'OVERWRITE', 'RETAIN']).optional().describe('File exists behavior'),
  }),
  execute: async ({ awsCredentials, region, applicationName, deploymentGroupName, revision, deploymentConfigName, description, ignoreApplicationStopFailures, targetInstances, autoRollbackConfiguration, updateOutdatedInstancesOnly, fileExistsBehavior }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeDeployClient(awsCredentials, region);

      const command = new CreateDeploymentCommand({
          applicationName: applicationName,
          deploymentGroupName: deploymentGroupName,
          revision: revision,
          deploymentConfigName: deploymentConfigName,
          description: description,
          ignoreApplicationStopFailures: ignoreApplicationStopFailures,
          targetInstances: targetInstances,
          autoRollbackConfiguration: autoRollbackConfiguration,
          updateOutdatedInstancesOnly: updateOutdatedInstancesOnly,
          fileExistsBehavior: fileExistsBehavior,
      } as any);
      const response = await client.send(command);
      return {
                  deploymentId: response.deploymentId,
              };
    } catch (err) {
      return { error: 'Failed to create a new deployment', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
