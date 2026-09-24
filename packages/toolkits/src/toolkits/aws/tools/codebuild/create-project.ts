import { tool } from 'ai';
import { z } from 'zod';
import { CreateProjectCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsCreateCodebuildProject = tool({
  description: 'Create a new CodeBuild project. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The name of the build project'),
    description: z.string().optional().describe('A description of the build project'),
    source: z.enum(['CODECOMMIT', 'CODEPIPELINE', 'GITHUB', 'GITHUB_ENTERPRISE', 'BITBUCKET', 'S3', 'NO_SOURCE']).describe('Information about the build input source code'),
    artifacts: z.enum(['CODEPIPELINE', 'S3', 'NO_ARTIFACTS']).describe('Information about the build output artifacts'),
    cache: z.enum(['NO_CACHE', 'S3', 'LOCAL']).optional().describe('Stores recently used information so that it can be quickly accessed at a later time'),
    environment: z.enum(['WINDOWS_CONTAINER', 'LINUX_CONTAINER', 'LINUX_GPU_CONTAINER', 'ARM_CONTAINER', 'WINDOWS_SERVER_2019_CONTAINER']).describe('Information about the build environment'),
    serviceRole: z.string().describe('The ARN of the AWS Identity and Access Management (IAM) role'),
    timeoutInMinutes: z.number().optional().describe('How long, in minutes, from 5 to 480 (8 hours), for CodeBuild to wait before timing out any related build'),
    queuedTimeoutInMinutes: z.number().optional().describe('The number of minutes a build is allowed to be queued before it times out'),
    encryptionKey: z.string().optional().describe('The AWS Key Management Service (AWS KMS) customer master key (CMK) to be used for encrypting the build output artifacts'),
    tags: z.array(z.record(z.any())).optional().describe('A list of tag key and value pairs associated with this build project'),
    vpcConfig: z.record(z.any()).optional().describe('VpcConfig enables AWS CodeBuild to access resources in an Amazon VPC'),
    badgeEnabled: z.boolean().optional().describe('Set this to true to generate a publicly accessible URL for your project build badge'),
    logsConfig: z.enum(['ENABLED', 'DISABLED']).optional().describe('Information about logs for a build project'),
    fileSystemLocations: z.enum(['EFS']).optional().describe('An array of ProjectFileSystemLocation objects for a CodeBuild build project'),
    buildBatchConfig: z.record(z.any()).optional().describe('A ProjectBuildBatchConfig object that defines the batch build options'),
    concurrentBuildLimit: z.number().optional().describe('The maximum number of concurrent builds'),
  }),
  execute: async ({ awsCredentials, region, name, description, source, artifacts, cache, environment, serviceRole, timeoutInMinutes, queuedTimeoutInMinutes, encryptionKey, tags, vpcConfig, badgeEnabled, logsConfig, fileSystemLocations, buildBatchConfig, concurrentBuildLimit }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeBuildClient(awsCredentials, region);

      const command = new CreateProjectCommand({
          name: name,
          description: description,
          source: source,
          artifacts: artifacts,
          cache: cache,
          environment: environment,
          serviceRole: serviceRole,
          timeoutInMinutes: timeoutInMinutes,
          queuedTimeoutInMinutes: queuedTimeoutInMinutes,
          encryptionKey: encryptionKey,
          tags: tags,
          vpcConfig: vpcConfig,
          badgeEnabled: badgeEnabled,
          logsConfig: logsConfig,
          fileSystemLocations: fileSystemLocations,
          buildBatchConfig: buildBatchConfig,
          concurrentBuildLimit: concurrentBuildLimit,
      } as any);
      const response = await client.send(command);
      return {
                  project: (response as any).project,
              };
    } catch (err) {
      return { error: 'Failed to create a new CodeBuild project', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
