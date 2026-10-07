// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
  vaultRequest,
  failedResult,
  toVaultError,
  normalizeMount,
  normalizeSecretPath,
} from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');
const mountField = z.string().describe('KV v2 mount path, e.g. secret or kv');
const pathField = z.string().describe('Secret path (without mount prefix)');

export const vaultKvRead = tool({
  description:
    'Read the latest version of a secret from a KV secrets engine v2 mount (GET .../data/{path}).',
  inputSchema: z.object({
    vaultCredentials: credField,
    mount: mountField,
    path: pathField,
    version: z.number().int().optional().describe('Specific version number to read'),
  }),
  execute: async ({ vaultCredentials, mount, path, version }) => {
    try {
      const m = normalizeMount(mount);
      const p = normalizeSecretPath(path);
      const result = await vaultRequest(vaultCredentials, `/${m}/data/${p}`, {
        query: version !== undefined ? { version } : undefined,
      });
      if (!result.ok) return failedResult('Failed to read KV secret', result);
      return result.data;
    } catch (error) {
      return toVaultError(error, 'Error reading KV secret');
    }
  },
});

export const vaultKvWrite = tool({
  description:
    'Write secret data to KV v2 (POST .../data/{path}). Supports check-and-set via cas option.',
  inputSchema: z.object({
    vaultCredentials: credField,
    mount: mountField,
    path: pathField,
    data: z.record(z.string(), z.any()).describe('Key/value secret payload'),
    cas: z.number().int().optional().describe('Check-and-set version (0 for new)'),
  }),
  execute: async ({ vaultCredentials, mount, path, data, cas }) => {
    try {
      const m = normalizeMount(mount);
      const p = normalizeSecretPath(path);
      const body: Record<string, unknown> = { data };
      if (cas !== undefined) {
        body.options = { cas };
      }
      const result = await vaultRequest(vaultCredentials, `/${m}/data/${p}`, {
        method: 'POST',
        body,
      });
      if (!result.ok) return failedResult('Failed to write KV secret', result);
      return result.data;
    } catch (error) {
      return toVaultError(error, 'Error writing KV secret');
    }
  },
});

export const vaultKvDelete = tool({
  description: 'Delete the latest version of a KV v2 secret (DELETE .../data/{path}).',
  inputSchema: z.object({
    vaultCredentials: credField,
    mount: mountField,
    path: pathField,
  }),
  execute: async ({ vaultCredentials, mount, path }) => {
    try {
      const m = normalizeMount(mount);
      const p = normalizeSecretPath(path);
      const result = await vaultRequest(vaultCredentials, `/${m}/data/${p}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete KV secret version', result);
      return result.data ?? { deleted: true, mount: m, path: p };
    } catch (error) {
      return toVaultError(error, 'Error deleting KV secret');
    }
  },
});

export const vaultKvList = tool({
  description: 'List secret keys under a path in KV v2 (LIST .../metadata/{path}).',
  inputSchema: z.object({
    vaultCredentials: credField,
    mount: mountField,
    path: z.string().optional().describe('Subpath to list (empty for mount root)'),
  }),
  execute: async ({ vaultCredentials, mount, path }) => {
    try {
      const m = normalizeMount(mount);
      const suffix = path ? normalizeSecretPath(path) : '';
      const apiPath = suffix ? `/${m}/metadata/${suffix}` : `/${m}/metadata`;
      const result = await vaultRequest(vaultCredentials, apiPath, { method: 'LIST' });
      if (!result.ok) {
        const fallback = await vaultRequest(vaultCredentials, apiPath, {
          query: { list: true },
        });
        if (!fallback.ok) return failedResult('Failed to list KV secrets', fallback);
        return fallback.data;
      }
      return result.data;
    } catch (error) {
      return toVaultError(error, 'Error listing KV secrets');
    }
  },
});

export const vaultKvReadMetadata = tool({
  description: 'Read KV v2 secret metadata (versions, custom metadata, delete flags).',
  inputSchema: z.object({
    vaultCredentials: credField,
    mount: mountField,
    path: pathField,
  }),
  execute: async ({ vaultCredentials, mount, path }) => {
    try {
      const m = normalizeMount(mount);
      const p = normalizeSecretPath(path);
      const result = await vaultRequest(vaultCredentials, `/${m}/metadata/${p}`);
      if (!result.ok) return failedResult('Failed to read KV metadata', result);
      return result.data;
    } catch (error) {
      return toVaultError(error, 'Error reading KV metadata');
    }
  },
});

export const vaultKvDeleteMetadata = tool({
  description: 'Permanently delete all versions and metadata of a KV v2 secret.',
  inputSchema: z.object({
    vaultCredentials: credField,
    mount: mountField,
    path: pathField,
  }),
  execute: async ({ vaultCredentials, mount, path }) => {
    try {
      const m = normalizeMount(mount);
      const p = normalizeSecretPath(path);
      const result = await vaultRequest(vaultCredentials, `/${m}/metadata/${p}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete KV metadata', result);
      return result.data ?? { deleted: true, mount: m, path: p };
    } catch (error) {
      return toVaultError(error, 'Error deleting KV metadata');
    }
  },
});

export const vaultKvDestroyVersions = tool({
  description: 'Permanently destroy specific KV v2 secret versions (POST .../destroy/{path}).',
  inputSchema: z.object({
    vaultCredentials: credField,
    mount: mountField,
    path: pathField,
    versions: z.array(z.number().int()).min(1).describe('Version numbers to destroy'),
  }),
  execute: async ({ vaultCredentials, mount, path, versions }) => {
    try {
      const m = normalizeMount(mount);
      const p = normalizeSecretPath(path);
      const result = await vaultRequest(vaultCredentials, `/${m}/destroy/${p}`, {
        method: 'POST',
        body: { versions },
      });
      if (!result.ok) return failedResult('Failed to destroy KV versions', result);
      return result.data ?? { destroyed: true, versions };
    } catch (error) {
      return toVaultError(error, 'Error destroying KV versions');
    }
  },
});
