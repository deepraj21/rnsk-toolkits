// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { jfrogRequest, failedResult, toJfrogError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'JFrog credentials JSON with baseUrl (Platform URL, e.g. https://mycompany.jfrog.io) plus accessToken, apiKey, or username+password',
  );
const buildNameField = z.string().describe('Build name');
const buildNumberField = z.string().describe('Build number');

export const jfrogListBuilds = tool({
  description: 'List all builds with links to their build-info. Use to discover build names.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
  }),
  execute: async ({ jfrogCredentials }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', '/build');
      if (!result.ok) return failedResult('Failed to list builds', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error listing builds');
    }
  },
});

export const jfrogGetBuild = tool({
  description: 'List all numbers (runs) of one build with links to each build-info.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    buildName: buildNameField,
  }),
  execute: async ({ jfrogCredentials, buildName }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', `/build/${buildName}`);
      if (!result.ok) return failedResult('Failed to get build', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error getting build');
    }
  },
});

export const jfrogGetBuildNumber = tool({
  description:
    'Get full build-info of one build run: modules, artifacts, dependencies, environment, and status.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    buildName: buildNameField,
    buildNumber: buildNumberField,
    project: z.string().optional().describe('Project key when the build belongs to a project'),
  }),
  execute: async ({ jfrogCredentials, buildName, buildNumber, project }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/build/${buildName}/${buildNumber}`,
        { query: { project } },
      );
      if (!result.ok) return failedResult('Failed to get build number', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error getting build number');
    }
  },
});

export const jfrogUploadBuildInfo = tool({
  description:
    'Publish build-info JSON for a build run (artifacts, dependencies, environment). Use after CI publishes artifacts so promotion and traceability work.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    buildInfo: z
      .record(z.string(), z.any())
      .describe(
        'Build-info object with version, name, number, started, buildAgent/agent, modules (artifacts with checksums), and properties',
      ),
    project: z.string().optional().describe('Project key when the build belongs to a project'),
  }),
  execute: async ({ jfrogCredentials, buildInfo, project }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', '/build', {
        method: 'PUT',
        query: { project },
        body: buildInfo,
      });
      if (!result.ok) return failedResult('Failed to upload build info', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error uploading build info');
    }
  },
});

export const jfrogPromoteBuild = tool({
  description:
    'Promote a build: change its status and optionally move or copy its artifacts (and dependencies) to a target repository, e.g. staging to release. Requires Deploy permission on the build.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    buildName: buildNameField,
    buildNumber: buildNumberField,
    targetRepo: z
      .string()
      .describe('Target repository key (omit for status-only promotion)')
      .optional(),
    status: z.string().optional().describe('New build status label, e.g. Released'),
    comment: z.string().optional().describe('Reason for the promotion'),
    ciUser: z.string().optional().describe('CI user invoking the promotion'),
    sourceRepo: z.string().optional().describe('Source repository; auto-resolved when omitted'),
    copy: z.boolean().optional().describe('Copy instead of moving artifacts'),
    artifacts: z.boolean().optional().describe('Move/copy the build artifacts (default true)'),
    dependencies: z.boolean().optional().describe('Move/copy the build dependencies'),
    scopes: z.array(z.string()).optional().describe('Dependency scopes, e.g. compile, runtime'),
    properties: z
      .record(z.string(), z.string())
      .optional()
      .describe('Properties to attach to promoted artifacts'),
    dryRun: z.boolean().optional().describe('Validate without promoting'),
    failFast: z.boolean().optional().describe('Abort on first error'),
    project: z.string().optional().describe('Project key when the build belongs to a project'),
  }),
  execute: async ({ jfrogCredentials, buildName, buildNumber, project, ...promotion }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/build/promote/${buildName}/${buildNumber}`,
        { method: 'POST', query: { project }, body: promotion },
      );
      if (!result.ok) return failedResult('Failed to promote build', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error promoting build');
    }
  },
});

export const jfrogDeleteBuilds = tool({
  description:
    'Delete build runs by numbers, optionally including their artifacts. Use for retention cleanup.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    buildName: buildNameField,
    buildNumbers: z.array(z.string()).min(1).describe('Build numbers to delete, e.g. ["12","13"]'),
    artifacts: z.boolean().optional().describe('Also delete the build artifacts'),
    deleteAll: z.boolean().optional().describe('Delete all builds (ignores buildNumbers)'),
  }),
  execute: async ({ jfrogCredentials, buildName, buildNumbers, artifacts, deleteAll }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', `/build/${buildName}`, {
        method: 'DELETE',
        query: {
          buildNumbers: buildNumbers.join(','),
          artifacts: artifacts === true ? 1 : undefined,
          deleteAll: deleteAll === true ? 1 : undefined,
        },
      });
      if (!result.ok) return failedResult('Failed to delete builds', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error deleting builds');
    }
  },
});

export const jfrogListDockerTags = tool({
  description:
    'List tags of a Docker image in a Docker repository with n/last pagination. Requires Container Registry or Pro.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    repoKey: z.string().describe('Docker repository key'),
    imageName: z.string().describe('Image name, e.g. my-app or team/my-app'),
    n: z.number().int().min(1).optional().describe('Maximum tags to return'),
    last: z.string().optional().describe('Last tag from the previous page'),
  }),
  execute: async ({ jfrogCredentials, repoKey, imageName, n, last }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/docker/${repoKey}/v2/${imageName}/tags/list`,
        { query: { n, last } },
      );
      if (!result.ok) return failedResult('Failed to list Docker tags', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error listing Docker tags');
    }
  },
});

export const jfrogListDockerRepositories = tool({
  description:
    'List Docker image repositories (catalog) in a Docker registry repository with n/last pagination.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    repoKey: z.string().describe('Docker repository key'),
    n: z.number().int().min(1).optional().describe('Maximum entries to return'),
    last: z.string().optional().describe('Last repository name from the previous page'),
  }),
  execute: async ({ jfrogCredentials, repoKey, n, last }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/docker/${repoKey}/v2/_catalog`,
        { query: { n, last } },
      );
      if (!result.ok) return failedResult('Failed to list Docker repositories', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error listing Docker repositories');
    }
  },
});
