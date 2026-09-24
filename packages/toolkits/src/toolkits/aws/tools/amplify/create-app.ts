import { tool } from 'ai';
import { z } from 'zod';
import { CreateAppCommand } from '@aws-sdk/client-amplify';
import { createAmplifyClient } from '../client.js';

export const awsCreateAmplifyApp = tool({
  description: 'Creates a new Amplify app. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The name for an Amplify app'),
    description: z.string().optional().describe('The description for an Amplify app'),
    repository: z.string().optional().describe('The repository for an Amplify app'),
    platform: z.string().optional().describe('The platform or framework for an Amplify app'),
    iamServiceRoleArn: z.string().optional().describe('The AWS Identity and Access Management (IAM) service role for an Amplify app'),
    oauthToken: z.string().optional().describe('The OAuth token for a third-party source control system'),
    accessToken: z.string().optional().describe('The personal access token for a third-party source control system'),
    environmentVariables: z.record(z.any()).optional().describe('The environment variables map for an Amplify app'),
    enableBranchAutoBuild: z.boolean().optional().describe('Enables the auto building of branches for an Amplify app'),
    enableBranchAutoDeletion: z.boolean().optional().describe('Automatically disconnect a branch in the Amplify Console when you delete a branch from your Git repository'),
    enableBasicAuth: z.boolean().optional().describe('Enables basic authorization for an Amplify app'),
    basicAuthCredentials: z.string().optional().describe('The credentials for basic authorization for an Amplify app'),
    customRules: z.array(z.record(z.any())).optional().describe('Describes the custom redirect and rewrite rules for an Amplify app'),
    tags: z.record(z.any()).optional().describe('The tag for an Amplify app'),
    buildSpec: z.string().optional().describe('The build specification (build spec) for an Amplify app'),
    customHeaders: z.string().optional().describe('The custom HTTP headers for an Amplify app'),
    enableAutoBranchCreation: z.boolean().optional().describe('Enables automated branch creation for an Amplify app'),
    autoBranchCreationPatterns: z.array(z.string()).optional().describe('The automated branch creation glob patterns for an Amplify app'),
    autoBranchCreationConfig: z.record(z.any()).optional().describe('The automated branch creation configuration for an Amplify app'),
  }),
  execute: async ({ awsCredentials, region, name, description, repository, platform, iamServiceRoleArn, oauthToken, accessToken, environmentVariables, enableBranchAutoBuild, enableBranchAutoDeletion, enableBasicAuth, basicAuthCredentials, customRules, tags, buildSpec, customHeaders, enableAutoBranchCreation, autoBranchCreationPatterns, autoBranchCreationConfig }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAmplifyClient(awsCredentials, region);

      const command = new CreateAppCommand({
          name: name,
          description: description,
          repository: repository,
          platform: platform,
          iamServiceRoleArn: iamServiceRoleArn,
          oauthToken: oauthToken,
          accessToken: accessToken,
          environmentVariables: environmentVariables,
          enableBranchAutoBuild: enableBranchAutoBuild,
          enableBranchAutoDeletion: enableBranchAutoDeletion,
          enableBasicAuth: enableBasicAuth,
          basicAuthCredentials: basicAuthCredentials,
          customRules: customRules,
          tags: tags,
          buildSpec: buildSpec,
          customHeaders: customHeaders,
          enableAutoBranchCreation: enableAutoBranchCreation,
          autoBranchCreationPatterns: autoBranchCreationPatterns,
          autoBranchCreationConfig: autoBranchCreationConfig,
      } as any);
      const response = await client.send(command);
      return {
                  app: response.app,
              };
    } catch (err) {
      return { error: 'Failed to creates a new Amplify app', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
