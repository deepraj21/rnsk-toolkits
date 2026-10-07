// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { jfrogRequest, failedResult, toJfrogError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'JFrog credentials JSON with baseUrl (Platform URL, e.g. https://mycompany.jfrog.io) plus accessToken, apiKey, or username+password',
  );
const reposField = z
  .string()
  .optional()
  .describe('Comma-separated repository keys to limit the search to');

export const jfrogSearchAql = tool({
  description:
    'Search with Artifactory Query Language: flexible queries over items, builds, and archives. Non-admin queries must include repo, path, and name.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    query: z
      .string()
      .describe(
        'AQL query string, e.g. items.find({"repo":"libs-release-local"}).include("repo","path","name")',
      ),
  }),
  execute: async ({ jfrogCredentials, query }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', '/search/aql', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        rawBody: query,
      });
      if (!result.ok) return failedResult('Failed to run AQL search', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error running AQL search');
    }
  },
});

export const jfrogSearchArtifact = tool({
  description:
    'Quick search artifacts by part of file name. Returns file-info URIs; search local or cache repos (not virtual).',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    name: z.string().min(1).describe('Part of the file name to search for'),
    repos: reposField,
  }),
  execute: async ({ jfrogCredentials, name, repos }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', '/search/artifact', {
        query: { name, repos },
      });
      if (!result.ok) return failedResult('Failed to search artifacts', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error searching artifacts');
    }
  },
});

export const jfrogSearchArchive = tool({
  description:
    'Search inside archive files (jars, zips) by entry name. Returns matching archive entries.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    name: z.string().min(1).describe('Part of the archive entry name to search for'),
    repos: reposField,
  }),
  execute: async ({ jfrogCredentials, name, repos }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', '/search/archive', {
        query: { name, repos },
      });
      if (!result.ok) return failedResult('Failed to search archives', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error searching archives');
    }
  },
});

export const jfrogSearchPattern = tool({
  description:
    'Search artifacts by Ant-style path pattern, e.g. org/acme/**/*.jar. Use for layout-aware discovery.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    pattern: z.string().describe('Ant-style pattern, e.g. org/acme/**/*.jar'),
    repos: reposField,
  }),
  execute: async ({ jfrogCredentials, pattern, repos }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', '/search/pattern', {
        query: { pattern, repos },
      });
      if (!result.ok) return failedResult('Failed to search by pattern', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error searching by pattern');
    }
  },
});

export const jfrogSearchGavc = tool({
  description:
    'Search Maven artifacts by group, artifact, version, and optional classifier coordinates.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    group: z.string().describe('Maven group ID, e.g. org.acme'),
    artifact: z.string().describe('Maven artifact ID, e.g. app'),
    version: z.string().optional().describe('Version; supports * wildcards'),
    classifier: z.string().optional().describe('Maven classifier'),
    repos: reposField,
  }),
  execute: async ({ jfrogCredentials, group, artifact, version, classifier, repos }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', '/search/gavc', {
        query: { g: group, a: artifact, v: version, c: classifier, repos },
      });
      if (!result.ok) return failedResult('Failed to search by GAVC', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error searching by GAVC');
    }
  },
});

export const jfrogSearchByProperty = tool({
  description:
    'Search artifacts by metadata properties. Use to find items tagged with build, maturity, or custom labels.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    properties: z
      .record(z.string(), z.string())
      .describe('Property filters as name/value pairs, e.g. {"build.name":"app","qa":"pass"}'),
    repos: reposField,
  }),
  execute: async ({ jfrogCredentials, properties, repos }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', '/search/prop', {
        query: { ...properties, repos },
      });
      if (!result.ok) return failedResult('Failed to search by property', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error searching by property');
    }
  },
});

export const jfrogSearchByChecksum = tool({
  description:
    'Find artifacts by checksum. Provide one of md5, sha1, or sha256. Use to locate exact binaries.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    md5: z.string().optional().describe('MD5 checksum'),
    sha1: z.string().optional().describe('SHA1 checksum'),
    sha256: z.string().optional().describe('SHA256 checksum'),
    repos: reposField,
  }),
  execute: async ({ jfrogCredentials, md5, sha1, sha256, repos }) => {
    try {
      if (!md5 && !sha1 && !sha256) {
        return {
          error: 'Failed to search by checksum',
          message: 'Provide one of md5, sha1, or sha256.',
        };
      }
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', '/search/checksum', {
        query: { md5, sha1, sha256, repos },
      });
      if (!result.ok) return failedResult('Failed to search by checksum', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error searching by checksum');
    }
  },
});

export const jfrogSearchLatestVersion = tool({
  description:
    'Find the latest artifact version by Maven coordinates. Use to resolve the newest release or integration build.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    group: z.string().describe('Maven group ID'),
    artifact: z.string().describe('Maven artifact ID'),
    version: z.string().optional().describe('Version pattern; omit for the absolute latest'),
    repos: reposField,
    remote: z.boolean().optional().describe('Set true to include remote repositories'),
  }),
  execute: async ({ jfrogCredentials, group, artifact, version, repos, remote }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', '/search/latestVersion', {
        query: {
          g: group,
          a: artifact,
          v: version,
          repos,
          remote: remote === true ? 1 : undefined,
        },
      });
      if (!result.ok) return failedResult('Failed to search latest version', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error searching latest version');
    }
  },
});

export const jfrogSearchByDate = tool({
  description:
    'Search artifacts by date range on created, modified, or last-downloaded timestamps. Use for stale-artifact cleanup.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    dateFields: z
      .string()
      .describe('Comma-separated fields: created, modified (lastModified), lastDownloaded'),
    from: z.number().int().describe('Range start as Unix timestamp in milliseconds'),
    to: z.number().int().describe('Range end as Unix timestamp in milliseconds'),
    repos: reposField,
  }),
  execute: async ({ jfrogCredentials, dateFields, from, to, repos }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', '/search/dates', {
        query: { dateFields, from, to, repos },
      });
      if (!result.ok) return failedResult('Failed to search by date', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error searching by date');
    }
  },
});

export const jfrogSearchNotDownloaded = tool({
  description:
    'Find artifacts not downloaded since a given time. Use to identify unused binaries for cleanup.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    notDownloadedSince: z.number().int().describe('Unix timestamp in milliseconds'),
    createdBefore: z
      .number()
      .int()
      .optional()
      .describe('Only artifacts created before this Unix timestamp in milliseconds'),
    repos: reposField,
  }),
  execute: async ({ jfrogCredentials, notDownloadedSince, createdBefore, repos }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        '/search/notDownloadedSince',
        {
          query: { notDownloadedSince, createdBefore, repos },
        },
      );
      if (!result.ok) return failedResult('Failed to search not-downloaded artifacts', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error searching not-downloaded artifacts');
    }
  },
});
