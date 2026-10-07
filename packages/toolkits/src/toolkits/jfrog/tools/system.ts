// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { jfrogRequest, failedResult, toJfrogError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'JFrog credentials JSON with baseUrl (Platform URL, e.g. https://mycompany.jfrog.io) plus accessToken, apiKey, or username+password',
  );

export const jfrogPing = tool({
  description:
    'Ping the JFrog Artifactory service. Returns "OK" when the service is reachable. Use as a connectivity check.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
  }),
  execute: async ({ jfrogCredentials }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', '/system/ping');
      if (!result.ok) return failedResult('Failed to ping Artifactory', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error pinging Artifactory');
    }
  },
});

export const jfrogGetVersion = tool({
  description:
    'Get the Artifactory service version, revision, license type, and add-ons. Use to check server capabilities.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
  }),
  execute: async ({ jfrogCredentials }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', '/system/version');
      if (!result.ok) return failedResult('Failed to get Artifactory version', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error getting Artifactory version');
    }
  },
});

export const jfrogGetStorageInfo = tool({
  description:
    'Get storage summary: used/available space, repository and binary counts, and file-store status. Use for capacity monitoring.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
  }),
  execute: async ({ jfrogCredentials }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', '/storageinfo');
      if (!result.ok) return failedResult('Failed to get storage info', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error getting storage info');
    }
  },
});

export const jfrogGetLicense = tool({
  description:
    'Get the Artifactory license details: type, licensed-to account, and expiry. Requires admin privileges.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
  }),
  execute: async ({ jfrogCredentials }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', '/system/license');
      if (!result.ok) return failedResult('Failed to get license', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error getting license');
    }
  },
});

export const jfrogGetRepositoryStorageSummary = tool({
  description:
    'Get storage summary for one repository: used space, folder/file counts, and items. Use to audit per-repo consumption.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    repoKey: z.string().describe('Repository key'),
  }),
  execute: async ({ jfrogCredentials, repoKey }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', `/storage/${repoKey}`);
      if (!result.ok) return failedResult('Failed to get repository storage summary', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error getting repository storage summary');
    }
  },
});
