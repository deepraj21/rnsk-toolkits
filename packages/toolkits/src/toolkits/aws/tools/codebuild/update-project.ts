import { tool } from 'ai';
import { z } from 'zod';
import { UpdateProjectCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsUpdateCodebuildProject = tool({
  description: 'Update a CodeBuild build project. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The name of the build project'),
    description: z.string().optional().describe('A new description of the build project'),
    source: z.record(z.any()).optional().describe('Information to be changed about the build input source code'),
    artifacts: z.record(z.any()).optional().describe('Information to be changed about the build output artifacts'),
    cache: z.record(z.any()).optional().describe('Stores recently used information'),
    environment: z.record(z.any()).optional().describe('Information to be changed about the build environment'),
    serviceRole: z.string().optional().describe('The replacement ARN of the IAM role'),
    timeoutInMinutes: z.number().optional().describe('The replacement value in minutes'),
    queuedTimeoutInMinutes: z.number().optional().describe('The number of minutes a build is allowed to be queued'),
    encryptionKey: z.string().optional().describe('The replacement AWS KMS key'),
    tags: z.array(z.record(z.any())).optional().describe('tags'),
    vpcConfig: z.record(z.any()).optional().describe('VPC configuration'),
    badgeEnabled: z.boolean().optional().describe('Set this to true to generate a publicly accessible URL'),
    logsConfig: z.record(z.any()).optional().describe('Information about logs'),
    fileSystemLocations: z.array(z.record(z.any())).optional().describe('An array of ProjectFileSystemLocation objects'),
    buildBatchConfig: z.record(z.any()).optional().describe('A ProjectBuildBatchConfig object'),
    concurrentBuildLimit: z.number().optional().describe('The maximum number of concurrent builds'),
  }),
  execute: async ({ awsCredentials, region, name, description, source, artifacts, cache, environment, serviceRole, timeoutInMinutes, queuedTimeoutInMinutes, encryptionKey, tags, vpcConfig, badgeEnabled, logsConfig, fileSystemLocations, buildBatchConfig, concurrentBuildLimit }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeBuildClient(awsCredentials, region);

      const command = new UpdateProjectCommand({
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
      return { error: 'Failed to update a CodeBuild build project', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
