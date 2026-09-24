import { tool } from 'ai';
import { z } from 'zod';
import { CreateBranchCommand } from '@aws-sdk/client-amplify';
import { createAmplifyClient } from '../client.js';

export const awsCreateAmplifyBranch = tool({
  description: 'Creates a new branch for an Amplify app. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    appId: z.string().describe('The unique ID for an Amplify app'),
    branchName: z.string().describe('The name for the branch'),
    description: z.string().optional().describe('The description for the branch'),
    stage: z.enum(['PRODUCTION', 'BETA', 'DEVELOPMENT', 'EXPERIMENTAL', 'PULL_REQUEST']).optional().describe('Describes the current stage for the branch'),
    framework: z.string().optional().describe('The framework for the branch'),
    enablePullRequestPreview: z.boolean().optional().describe('Enables pull request previews for this branch'),
    pullRequestEnvironmentName: z.string().optional().describe('The Amplify environment name for the pull request'),
    environmentVariables: z.record(z.any()).optional().describe('The environment variables for the branch'),
    enableAutoBuild: z.boolean().optional().describe('Enables auto building for the branch'),
    enablePerformanceMode: z.boolean().optional().describe('Enables performance mode for the branch'),
    enableNotification: z.boolean().optional().describe('Enables notifications for the branch'),
    ttl: z.string().optional().describe('The content Time To Live (TTL) for the website in seconds'),
    displayName: z.string().optional().describe('The display name for a branch'),
    enableBasicAuth: z.boolean().optional().describe('Enables basic authorization for the branch'),
    basicAuthCredentials: z.string().optional().describe('The basic authorization credentials for the branch'),
    buildSpec: z.string().optional().describe('The build specification (build spec) for the branch'),
    tags: z.record(z.any()).optional().describe('The tag for the branch'),
    backendEnvironmentArn: z.string().optional().describe('The Amazon Resource Name (ARN) for a backend environment that is part of an Amplify app'),
  }),
  execute: async ({ awsCredentials, region, appId, branchName, description, stage, framework, enablePullRequestPreview, pullRequestEnvironmentName, environmentVariables, enableAutoBuild, enablePerformanceMode, enableNotification, ttl, displayName, enableBasicAuth, basicAuthCredentials, buildSpec, tags, backendEnvironmentArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAmplifyClient(awsCredentials, region);

      const command = new CreateBranchCommand({
          appId: appId,
          branchName: branchName,
          description: description,
          stage: stage as any,
          framework: framework,
          enablePullRequestPreview: enablePullRequestPreview,
          pullRequestEnvironmentName: pullRequestEnvironmentName,
          environmentVariables: environmentVariables,
          enableAutoBuild: enableAutoBuild,
          enablePerformanceMode: enablePerformanceMode,
          enableNotification: enableNotification,
          ttl: ttl,
          displayName: displayName,
          enableBasicAuth: enableBasicAuth,
          basicAuthCredentials: basicAuthCredentials,
          buildSpec: buildSpec,
          tags: tags,
          backendEnvironmentArn: backendEnvironmentArn,
      });
      const response = await client.send(command);
      return {
                  branch: response.branch,
              };
    } catch (err) {
      return { error: 'Failed to creates a new branch for an Amplify app', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
