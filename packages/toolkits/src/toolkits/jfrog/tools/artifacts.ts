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
const itemPathField = z
  .string()
  .describe('Item path inside the repository, e.g. org/acme/app-1.0.jar');

export const jfrogGetItemInfo = tool({
  description:
    'Get file or folder info: size, checksums, timestamps, download URI, and children. Use to inspect any stored item.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    repoKey: repoKeyField,
    itemPath: itemPathField,
  }),
  execute: async ({ jfrogCredentials, repoKey, itemPath }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/storage/${repoKey}/${itemPath}`,
      );
      if (!result.ok) return failedResult('Failed to get item info', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error getting item info');
    }
  },
});

export const jfrogListFolder = tool({
  description:
    'List children of a folder with optional deep traversal, folder-only listing, and timestamp metadata. Use to browse repository contents.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    repoKey: repoKeyField,
    itemPath: z.string().optional().describe('Folder path; omit or empty for repository root'),
    deep: z.boolean().optional().describe('Recurse into subfolders'),
    depth: z.number().int().min(0).optional().describe('Recursion depth limit'),
    listFolders: z.boolean().optional().describe('Set false to list files only'),
    mdTimestamps: z.boolean().optional().describe('Include Maven metadata timestamps'),
    includeRootPath: z.boolean().optional().describe('Include the root path in child entries'),
  }),
  execute: async ({
    jfrogCredentials,
    repoKey,
    itemPath,
    deep,
    depth,
    listFolders,
    mdTimestamps,
    includeRootPath,
  }) => {
    try {
      const path = itemPath ? `/storage/${repoKey}/${itemPath}` : `/storage/${repoKey}`;
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', path, {
        query: {
          list: true,
          deep: deep === true ? 1 : undefined,
          depth,
          listFolders: listFolders === false ? 0 : undefined,
          mdTimestamps: mdTimestamps === true ? 1 : undefined,
          includeRootPath: includeRootPath === true ? 1 : undefined,
        },
      });
      if (!result.ok) return failedResult('Failed to list folder', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error listing folder');
    }
  },
});

export const jfrogGetFileStats = tool({
  description:
    'Get file statistics: download count, last downloaded timestamp and user, remote download count. Use for artifact usage analytics.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    repoKey: repoKeyField,
    itemPath: itemPathField,
  }),
  execute: async ({ jfrogCredentials, repoKey, itemPath }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/storage/${repoKey}/${itemPath}`,
        { query: { stats: 0 } },
      );
      if (!result.ok) return failedResult('Failed to get file stats', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error getting file stats');
    }
  },
});

export const jfrogGetItemProperties = tool({
  description:
    'Get metadata properties attached to a file or folder. Pass names to select specific properties; omit for all.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    repoKey: repoKeyField,
    itemPath: itemPathField,
    propertyNames: z
      .array(z.string())
      .optional()
      .describe('Property names to return; omit for all properties'),
  }),
  execute: async ({ jfrogCredentials, repoKey, itemPath, propertyNames }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/storage/${repoKey}/${itemPath}`,
        { query: propertyNames ? { properties: propertyNames.join(',') } : { properties: '' } },
      );
      if (!result.ok) return failedResult('Failed to get item properties', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error getting item properties');
    }
  },
});

export const jfrogSetItemProperties = tool({
  description:
    'Attach metadata properties to a file or folder (recursive option for folders). Use to tag builds, maturity, or ownership.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    repoKey: repoKeyField,
    itemPath: itemPathField,
    properties: z
      .record(z.string(), z.union([z.string(), z.array(z.string())]))
      .describe('Properties to set as name/value pairs, e.g. {"build.name":"app","qa":["pass"]}'),
    recursive: z.boolean().optional().describe('Apply recursively to folder contents'),
  }),
  execute: async ({ jfrogCredentials, repoKey, itemPath, properties, recursive }) => {
    try {
      const encoded = Object.entries(properties)
        .map(([key, value]) =>
          Array.isArray(value)
            ? value.map((item) => `${key}=${item}`).join(',')
            : `${key}=${value}`,
        )
        .join(',');
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/storage/${repoKey}/${itemPath}`,
        {
          method: 'PUT',
          query: { properties: encoded, recursive: recursive === true ? 1 : undefined },
        },
      );
      if (!result.ok) return failedResult('Failed to set item properties', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error setting item properties');
    }
  },
});

export const jfrogDeleteItemProperties = tool({
  description: 'Delete metadata properties from a file or folder.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    repoKey: repoKeyField,
    itemPath: itemPathField,
    propertyNames: z.array(z.string()).min(1).describe('Property names to delete'),
  }),
  execute: async ({ jfrogCredentials, repoKey, itemPath, propertyNames }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/storage/${repoKey}/${itemPath}`,
        { method: 'DELETE', query: { properties: propertyNames.join(',') } },
      );
      if (!result.ok) return failedResult('Failed to delete item properties', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error deleting item properties');
    }
  },
});

export const jfrogDeployArtifact = tool({
  description:
    'Deploy (upload) a text-based artifact: configs, manifests, scripts, POMs. For binaries, deploy via CI tooling instead. Supports checksums and initial properties.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    repoKey: repoKeyField,
    itemPath: itemPathField,
    content: z.string().describe('File content as text (UTF-8)'),
    contentType: z.string().optional().describe('MIME type, e.g. application/xml'),
    properties: z
      .record(z.string(), z.string())
      .optional()
      .describe('Initial properties as name/value pairs'),
    sha1: z.string().optional().describe('Expected SHA1 checksum for validation'),
    sha256: z.string().optional().describe('Expected SHA256 checksum for validation'),
  }),
  execute: async ({
    jfrogCredentials,
    repoKey,
    itemPath,
    content,
    contentType,
    properties,
    sha1,
    sha256,
  }) => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': contentType ?? 'text/plain; charset=utf-8',
      };
      if (sha1) headers['X-Checksum-Sha1'] = sha1;
      if (sha256) headers['X-Checksum-Sha256'] = sha256;
      const query =
        properties && Object.keys(properties).length
          ? {
              properties: Object.entries(properties)
                .map(([key, value]) => `${key}=${value}`)
                .join(','),
            }
          : undefined;
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/${repoKey}/${itemPath}`,
        {
          method: 'PUT',
          headers,
          query,
          rawBody: content,
        },
      );
      if (!result.ok) return failedResult('Failed to deploy artifact', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error deploying artifact');
    }
  },
});

export const jfrogDownloadArtifact = tool({
  description:
    'Download a small artifact and return it base64-encoded with content type and size. Prefer it for configs, logs, and small reports — not large binaries.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    repoKey: repoKeyField,
    itemPath: itemPathField,
  }),
  execute: async ({ jfrogCredentials, repoKey, itemPath }) => {
    try {
      let credentials: {
        accessToken?: string;
        apiKey?: string;
        username?: string;
        password?: string;
        baseUrl?: string;
      };
      try {
        credentials = JSON.parse(jfrogCredentials);
      } catch {
        return {
          error: 'Failed to download artifact',
          statusCode: 400,
          details: { error: 'Invalid credentials JSON' },
        };
      }
      const base = (credentials.baseUrl ?? '').trim().replace(/\/+$/, '');
      if (!base) {
        return {
          error: 'Failed to download artifact',
          statusCode: 401,
          details: { error: 'baseUrl is required' },
        };
      }
      const headers: Record<string, string> = {};
      if (credentials.accessToken) headers.Authorization = `Bearer ${credentials.accessToken}`;
      else if (credentials.apiKey) headers['X-JFrog-Art-Api'] = credentials.apiKey;
      else if (credentials.username && credentials.password) {
        headers.Authorization = `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')}`;
      } else {
        return {
          error: 'Failed to download artifact',
          statusCode: 401,
          details: { error: 'No auth material in credentials' },
        };
      }
      const url = `${/^https?:\/\//i.test(base) ? base : `https://${base}`}/artifactory/${repoKey}/${itemPath}`;
      const response = await fetch(url, { headers });
      if (!response.ok) {
        const details = await response.text().catch(() => '');
        return { error: 'Failed to download artifact', statusCode: response.status, details };
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      return {
        repoKey,
        itemPath,
        size: buffer.length,
        contentType: response.headers.get('content-type') ?? 'application/octet-stream',
        contentBase64: buffer.toString('base64'),
      };
    } catch (error) {
      return toJfrogError(error, 'Error downloading artifact');
    }
  },
});

export const jfrogDeleteArtifact = tool({
  description: 'Delete a file or folder from a repository. Use to remove stale artifacts.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    repoKey: repoKeyField,
    itemPath: itemPathField,
  }),
  execute: async ({ jfrogCredentials, repoKey, itemPath }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/${repoKey}/${itemPath}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok) return failedResult('Failed to delete artifact', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error deleting artifact');
    }
  },
});

export const jfrogCopyArtifact = tool({
  description:
    'Copy a file or folder to another repository path. Use for promotion-style flows or backups.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    repoKey: repoKeyField,
    itemPath: itemPathField,
    targetRepoKey: z.string().describe('Target repository key'),
    targetPath: z.string().describe('Target path, e.g. org/acme/app-1.0.jar'),
    dryRun: z.boolean().optional().describe('Validate without copying'),
    failFast: z.boolean().optional().describe('Abort on first error'),
    suppressLayouts: z.boolean().optional().describe('Suppress layout translation (Maven repos)'),
  }),
  execute: async ({
    jfrogCredentials,
    repoKey,
    itemPath,
    targetRepoKey,
    targetPath,
    dryRun,
    failFast,
    suppressLayouts,
  }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/copy/${repoKey}/${itemPath}`,
        {
          method: 'POST',
          query: {
            to: `/${targetRepoKey}/${targetPath}`,
            dry: dryRun === true ? 1 : undefined,
            failFast: failFast === true ? 1 : undefined,
            suppressLayouts: suppressLayouts === true ? 1 : undefined,
          },
        },
      );
      if (!result.ok) return failedResult('Failed to copy artifact', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error copying artifact');
    }
  },
});

export const jfrogMoveArtifact = tool({
  description: 'Move a file or folder to another repository path. The source is removed.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    repoKey: repoKeyField,
    itemPath: itemPathField,
    targetRepoKey: z.string().describe('Target repository key'),
    targetPath: z.string().describe('Target path, e.g. org/acme/app-1.0.jar'),
    dryRun: z.boolean().optional().describe('Validate without moving'),
    failFast: z.boolean().optional().describe('Abort on first error'),
    suppressLayouts: z.boolean().optional().describe('Suppress layout translation (Maven repos)'),
  }),
  execute: async ({
    jfrogCredentials,
    repoKey,
    itemPath,
    targetRepoKey,
    targetPath,
    dryRun,
    failFast,
    suppressLayouts,
  }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/move/${repoKey}/${itemPath}`,
        {
          method: 'POST',
          query: {
            to: `/${targetRepoKey}/${targetPath}`,
            dry: dryRun === true ? 1 : undefined,
            failFast: failFast === true ? 1 : undefined,
            suppressLayouts: suppressLayouts === true ? 1 : undefined,
          },
        },
      );
      if (!result.ok) return failedResult('Failed to move artifact', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error moving artifact');
    }
  },
});
