import { tool } from 'ai';
import { z } from 'zod';
import { StartBuildCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsStartCodebuildBuild = tool({
  description: 'Start running a build. Use it to start a stopped resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    projectName: z.string().describe('The name of the CodeBuild build project to start running a build'),
    secondarySourcesOverride: z.array(z.record(z.any())).optional().describe('An array of ProjectSource objects'),
    secondarySourcesVersionOverride: z.array(z.record(z.any())).optional().describe('An array of ProjectSourceVersion objects'),
    sourceVersion: z.string().optional().describe('A version of the build input to be built'),
    artifactsOverride: z.record(z.any()).optional().describe('Build output artifact settings that override, for this build only'),
    secondaryArtifactsOverride: z.array(z.record(z.any())).optional().describe('An array of ProjectArtifacts objects'),
    environmentVariablesOverride: z.enum(['PLAINTEXT', 'PARAMETER_STORE', 'SECRETS_MANAGER']).optional().describe('A set of environment variables that overrides, for this build only'),
    sourceTypeOverride: z.enum(['CODECOMMIT', 'CODEPIPELINE', 'GITHUB', 'GITHUB_ENTERPRISE', 'BITBUCKET', 'S3', 'NO_SOURCE']).optional().describe('A source input type'),
    sourceLocationOverride: z.string().optional().describe('A location that overrides'),
    sourceAuthOverride: z.record(z.any()).optional().describe('An authorization type for this source'),
    gitCloneDepthOverride: z.number().optional().describe('The user-defined depth of history'),
    gitSubmodulesConfigOverride: z.record(z.any()).optional().describe('Information about the Git submodules'),
    buildspecOverride: z.string().optional().describe('A buildspec file declaration'),
    insecureSslOverride: z.boolean().optional().describe('Enable this flag to override the insecure SSL setting'),
    reportBuildStatusOverride: z.boolean().optional().describe('Set to true to report to your source provider'),
    environmentTypeOverride: z.enum(['WINDOWS_CONTAINER', 'LINUX_CONTAINER', 'LINUX_GPU_CONTAINER', 'ARM_CONTAINER', 'WINDOWS_SERVER_2019_CONTAINER']).optional().describe('A container type for this build'),
    imageOverride: z.string().optional().describe('The name of an image for this build'),
    computeTypeOverride: z.enum(['BUILD_GENERAL1_SMALL', 'BUILD_GENERAL1_MEDIUM', 'BUILD_GENERAL1_LARGE', 'BUILD_GENERAL1_2XLARGE']).optional().describe('The name of a compute type for this build'),
    certificateOverride: z.string().optional().describe('The name of a certificate for this build'),
    cacheOverride: z.record(z.any()).optional().describe('A ProjectCache object'),
    serviceRoleOverride: z.string().optional().describe('The name of a service role for this build'),
    privilegedModeOverride: z.boolean().optional().describe('Enable this flag to override privileged mode'),
    timeoutInMinutesOverride: z.number().optional().describe('The number of build timeout minutes'),
    queuedTimeoutInMinutesOverride: z.number().optional().describe('The number of minutes a build is allowed to be queued'),
    encryptionKeyOverride: z.string().optional().describe('The AWS Key Management Service (AWS KMS) customer master key (CMK)'),
    idempotencyToken: z.string().optional().describe('A unique, case sensitive identifier'),
    logsConfigOverride: z.record(z.any()).optional().describe('Log settings for this build'),
    registryCredentialOverride: z.record(z.any()).optional().describe('The credentials for access to a private Docker registry'),
    imagePullCredentialsTypeOverride: z.enum(['CODEBUILD', 'SERVICE_ROLE']).optional().describe('The type of credentials'),
    debugSessionEnabled: z.boolean().optional().describe('Specifies if session debugging is enabled for this build'),
  }),
  execute: async ({ awsCredentials, region, projectName, secondarySourcesOverride, secondarySourcesVersionOverride, sourceVersion, artifactsOverride, secondaryArtifactsOverride, environmentVariablesOverride, sourceTypeOverride, sourceLocationOverride, sourceAuthOverride, gitCloneDepthOverride, gitSubmodulesConfigOverride, buildspecOverride, insecureSslOverride, reportBuildStatusOverride, environmentTypeOverride, imageOverride, computeTypeOverride, certificateOverride, cacheOverride, serviceRoleOverride, privilegedModeOverride, timeoutInMinutesOverride, queuedTimeoutInMinutesOverride, encryptionKeyOverride, idempotencyToken, logsConfigOverride, registryCredentialOverride, imagePullCredentialsTypeOverride, debugSessionEnabled }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeBuildClient(awsCredentials, region);

      const command = new StartBuildCommand({
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
          reportBuildStatusOverride: reportBuildStatusOverride,
          environmentTypeOverride: environmentTypeOverride as any,
          imageOverride: imageOverride,
          computeTypeOverride: computeTypeOverride as any,
          certificateOverride: certificateOverride,
          cacheOverride: cacheOverride,
          serviceRoleOverride: serviceRoleOverride,
          privilegedModeOverride: privilegedModeOverride,
          timeoutInMinutesOverride: timeoutInMinutesOverride,
          queuedTimeoutInMinutesOverride: queuedTimeoutInMinutesOverride,
          encryptionKeyOverride: encryptionKeyOverride,
          idempotencyToken: idempotencyToken,
          logsConfigOverride: logsConfigOverride,
          registryCredentialOverride: registryCredentialOverride,
          imagePullCredentialsTypeOverride: imagePullCredentialsTypeOverride as any,
          debugSessionEnabled: debugSessionEnabled,
      } as any);
      const response = await client.send(command);
      return {
                  build: response.build,
              };
    } catch (err) {
      return { error: 'Failed to start running a build', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
