import { tool } from 'ai';
import { z } from 'zod';
import { StartBuildBatchCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsStartCodebuildBuildBatch = tool({
  description: 'Starts a batch build for a project. Use it to start a stopped resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    projectName: z.string().describe('The name of the project'),
    secondarySourcesOverride: z.array(z.record(z.any())).optional().describe('An array of ProjectSource objects'),
    secondarySourcesVersionOverride: z.array(z.record(z.any())).optional().describe('An array of ProjectSourceVersion objects'),
    sourceVersion: z.string().optional().describe('The version of the build input to be built'),
    artifactsOverride: z.record(z.any()).optional().describe('An array of ProjectArtifacts objects'),
    secondaryArtifactsOverride: z.array(z.record(z.any())).optional().describe('An array of ProjectArtifacts objects'),
    environmentVariablesOverride: z.enum(['PLAINTEXT', 'PARAMETER_STORE', 'SECRETS_MANAGER']).optional().describe('environmentVariablesOverride'),
    sourceTypeOverride: z.enum(['CODECOMMIT', 'CODEPIPELINE', 'GITHUB', 'GITHUB_ENTERPRISE', 'BITBUCKET', 'S3', 'NO_SOURCE']).optional().describe('sourceTypeOverride'),
    sourceLocationOverride: z.string().optional().describe('sourceLocationOverride'),
    sourceAuthOverride: z.record(z.any()).optional().describe('sourceAuthOverride'),
    gitCloneDepthOverride: z.number().optional().describe('gitCloneDepthOverride'),
    gitSubmodulesConfigOverride: z.record(z.any()).optional().describe('gitSubmodulesConfigOverride'),
    buildspecOverride: z.string().optional().describe('buildspecOverride'),
    insecureSslOverride: z.boolean().optional().describe('insecureSslOverride'),
    reportBuildStatusOverride: z.boolean().optional().describe('reportBuildStatusOverride'),
    environmentTypeOverride: z.enum(['WINDOWS_CONTAINER', 'LINUX_CONTAINER', 'LINUX_GPU_CONTAINER', 'ARM_CONTAINER', 'WINDOWS_SERVER_2019_CONTAINER']).optional().describe('environmentTypeOverride'),
    imageOverride: z.string().optional().describe('imageOverride'),
    computeTypeOverride: z.enum(['BUILD_GENERAL1_SMALL', 'BUILD_GENERAL1_MEDIUM', 'BUILD_GENERAL1_LARGE', 'BUILD_GENERAL1_2XLARGE']).optional().describe('computeTypeOverride'),
    certificateOverride: z.string().optional().describe('certificateOverride'),
    cacheOverride: z.record(z.any()).optional().describe('cacheOverride'),
    serviceRoleOverride: z.string().optional().describe('serviceRoleOverride'),
    privilegedModeOverride: z.boolean().optional().describe('privilegedModeOverride'),
    buildBatchConfigOverride: z.record(z.any()).optional().describe('buildBatchConfigOverride'),
    encryptionKeyOverride: z.string().optional().describe('encryptionKeyOverride'),
    idempotencyToken: z.string().optional().describe('idempotencyToken'),
    logsConfigOverride: z.record(z.any()).optional().describe('logsConfigOverride'),
    registryCredentialOverride: z.record(z.any()).optional().describe('registryCredentialOverride'),
    imagePullCredentialsTypeOverride: z.enum(['CODEBUILD', 'SERVICE_ROLE']).optional().describe('imagePullCredentialsTypeOverride'),
  }),
  execute: async ({ awsCredentials, region, projectName, secondarySourcesOverride, secondarySourcesVersionOverride, sourceVersion, artifactsOverride, secondaryArtifactsOverride, environmentVariablesOverride, sourceTypeOverride, sourceLocationOverride, sourceAuthOverride, gitCloneDepthOverride, gitSubmodulesConfigOverride, buildspecOverride, insecureSslOverride, reportBuildStatusOverride, environmentTypeOverride, imageOverride, computeTypeOverride, certificateOverride, cacheOverride, serviceRoleOverride, privilegedModeOverride, buildBatchConfigOverride, encryptionKeyOverride, idempotencyToken, logsConfigOverride, registryCredentialOverride, imagePullCredentialsTypeOverride }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeBuildClient(awsCredentials, region);

      const command = new StartBuildBatchCommand({
          projectName: projectName,
          secondarySourcesOverride: secondarySourcesOverride,
          secondarySourcesVersionOverride: secondarySourcesVersionOverride,
          sourceVersion: sourceVersion,
          artifactsOverride: artifactsOverride,
          secondaryArtifactsOverride: secondaryArtifactsOverride,
          environmentVariablesOverride: environmentVariablesOverride,
          sourceTypeOverride: sourceTypeOverride as any,
          sourceLocationOverride: sourceLocationOverride,
          sourceAuthOverride: sourceAuthOverride,
          gitCloneDepthOverride: gitCloneDepthOverride,
          gitSubmodulesConfigOverride: gitSubmodulesConfigOverride,
          buildspecOverride: buildspecOverride,
          insecureSslOverride: insecureSslOverride,
          reportBuildBatchStatusOverride: reportBuildStatusOverride,
          environmentTypeOverride: environmentTypeOverride as any,
          imageOverride: imageOverride,
          computeTypeOverride: computeTypeOverride as any,
          certificateOverride: certificateOverride,
          cacheOverride: cacheOverride,
          serviceRoleOverride: serviceRoleOverride,
          privilegedModeOverride: privilegedModeOverride,
          buildBatchConfigOverride: buildBatchConfigOverride,
          encryptionKeyOverride: encryptionKeyOverride,
          idempotencyToken: idempotencyToken,
          logsConfigOverride: logsConfigOverride,
          registryCredentialOverride: registryCredentialOverride,
          imagePullCredentialsTypeOverride: imagePullCredentialsTypeOverride as any,
      } as any);
      const response = await client.send(command);
      return {
                  buildBatch: response.buildBatch,
              };
    } catch (err) {
      return { error: 'Failed to starts a batch build for a project', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
