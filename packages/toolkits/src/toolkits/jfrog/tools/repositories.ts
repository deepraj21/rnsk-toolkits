// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { jfrogRequest, failedResult, toJfrogError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'JFrog credentials JSON with baseUrl (Platform URL, e.g. https://mycompany.jfrog.io) plus accessToken, apiKey, or username+password',
  );
const repoKeyField = z.string().describe('Repository key');

export const jfrogListRepositories = tool({
  description:
    'List all repositories with optional type and package-type filters. Use to discover repo keys.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    type: z
      .enum(['local', 'remote', 'virtual', 'federated'])
      .optional()
      .describe('Filter by repository type'),
    packageType: z
      .string()
      .optional()
      .describe('Filter by package type, e.g. maven, docker, npm, pypi, generic'),
  }),
  execute: async ({ jfrogCredentials, type, packageType }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', '/repositories', {
        query: { type, packageType },
      });
      if (!result.ok) return failedResult('Failed to list repositories', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error listing repositories');
    }
  },
});

export const jfrogGetRepository = tool({
  description: 'Get the full configuration of one repository by key.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    repoKey: repoKeyField,
  }),
  execute: async ({ jfrogCredentials, repoKey }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/repositories/${repoKey}`,
      );
      if (!result.ok) return failedResult('Failed to get repository', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error getting repository');
    }
  },
});

const repoConfigField = z
  .record(z.string(), z.any())
  .describe(
    'Repository configuration object: key, rclass (local/remote/virtual/federated), packageType, plus type-specific settings (url for remote, repositories list for virtual)',
  );

export const jfrogCreateRepository = tool({
  description:
    'Create a new repository or fully replace an existing one. Requires admin privileges. Provide key, rclass, and packageType at minimum.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    repoKey: repoKeyField,
    repository: repoConfigField,
  }),
  execute: async ({ jfrogCredentials, repoKey, repository }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/repositories/${repoKey}`,
        {
          method: 'PUT',
          body: { key: repoKey, ...repository },
        },
      );
      if (!result.ok) return failedResult('Failed to create repository', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error creating repository');
    }
  },
});

export const jfrogUpdateRepository = tool({
  description:
    'Partially update an existing repository configuration. Only provided fields change. Requires admin privileges.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    repoKey: repoKeyField,
    repository: z
      .record(z.string(), z.any())
      .describe('Partial repository configuration with the fields to update'),
  }),
  execute: async ({ jfrogCredentials, repoKey, repository }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/repositories/${repoKey}`,
        {
          method: 'POST',
          body: repository,
        },
      );
      if (!result.ok) return failedResult('Failed to update repository', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error updating repository');
    }
  },
});

export const jfrogDeleteRepository = tool({
  description:
    'Delete a repository and its content. Requires admin privileges. Use when decommissioning a repo.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    repoKey: repoKeyField,
  }),
  execute: async ({ jfrogCredentials, repoKey }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/repositories/${repoKey}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok) return failedResult('Failed to delete repository', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error deleting repository');
    }
  },
});

export const jfrogListReplications = tool({
  description:
    'List replication configurations across repositories. Use to audit pull/push replication.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
  }),
  execute: async ({ jfrogCredentials }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', '/replications');
      if (!result.ok) return failedResult('Failed to list replications', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error listing replications');
    }
  },
});

export const jfrogGetReplication = tool({
  description: 'Get the replication configuration of one repository by key.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    repoKey: repoKeyField,
  }),
  execute: async ({ jfrogCredentials, repoKey }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/replications/${repoKey}`,
      );
      if (!result.ok) return failedResult('Failed to get replication', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error getting replication');
    }
  },
});

export const jfrogSaveReplication = tool({
  description:
    'Create or update the replication configuration of a repository (cron schedule, sync deletes/properties/statistics, target URL for push). Requires admin privileges.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    repoKey: repoKeyField,
    replication: z
      .record(z.string(), z.any())
      .describe(
        'Replication config: enabled, cronExp, syncDeletes, syncProperties, syncStatistics, pathPrefix, url/username/password for push replication',
      ),
  }),
  execute: async ({ jfrogCredentials, repoKey, replication }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/replications/${repoKey}`,
        {
          method: 'PUT',
          body: replication,
        },
      );
      if (!result.ok) return failedResult('Failed to save replication', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error saving replication');
    }
  },
});

export const jfrogDeleteReplication = tool({
  description: 'Delete the replication configuration of a repository. Requires admin privileges.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    repoKey: repoKeyField,
  }),
  execute: async ({ jfrogCredentials, repoKey }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/replications/${repoKey}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok) return failedResult('Failed to delete replication', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error deleting replication');
    }
  },
});
