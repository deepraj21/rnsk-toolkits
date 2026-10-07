// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { vaultRequest, failedResult, toVaultError, normalizeMount } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const vaultGetHealth = tool({
  description:
    'Check Vault health and seal status (GET /sys/health). Uses address from credentials; does not require a valid token.',
  inputSchema: z.object({
    vaultCredentials: credField,
  }),
  execute: async ({ vaultCredentials }) => {
    try {
      const result = await vaultRequest(vaultCredentials, '/sys/health', {
        skipAuth: true,
        addressOnly: true,
      });
      if (!result.ok && result.status !== 429 && result.status !== 472 && result.status !== 473) {
        return failedResult('Failed to get Vault health', result);
      }
      return result.data;
    } catch (error) {
      return toVaultError(error, 'Error getting Vault health');
    }
  },
});

export const vaultListMounts = tool({
  description: 'List enabled secrets engines and auth methods (GET /sys/mounts).',
  inputSchema: z.object({
    vaultCredentials: credField,
  }),
  execute: async ({ vaultCredentials }) => {
    try {
      const result = await vaultRequest(vaultCredentials, '/sys/mounts');
      if (!result.ok) return failedResult('Failed to list mounts', result);
      return result.data;
    } catch (error) {
      return toVaultError(error, 'Error listing mounts');
    }
  },
});

export const vaultReadMount = tool({
  description: 'Read configuration of a specific mount (GET /sys/mounts/{path}).',
  inputSchema: z.object({
    vaultCredentials: credField,
    mount: z.string().describe('Mount path with trailing slash, e.g. secret/ or auth/approle/'),
  }),
  execute: async ({ vaultCredentials, mount }) => {
    try {
      let m = normalizeMount(mount);
      if (!m.endsWith('/')) m = `${m}/`;
      const result = await vaultRequest(vaultCredentials, `/sys/mounts/${m}`);
      if (!result.ok) return failedResult('Failed to read mount', result);
      return result.data;
    } catch (error) {
      return toVaultError(error, 'Error reading mount');
    }
  },
});

export const vaultGetSealStatus = tool({
  description: 'Get seal status (GET /sys/seal-status).',
  inputSchema: z.object({
    vaultCredentials: credField,
  }),
  execute: async ({ vaultCredentials }) => {
    try {
      const result = await vaultRequest(vaultCredentials, '/sys/seal-status');
      if (!result.ok) return failedResult('Failed to get seal status', result);
      return result.data;
    } catch (error) {
      return toVaultError(error, 'Error getting seal status');
    }
  },
});

export const vaultGetLeader = tool({
  description: 'Get HA leader address (GET /sys/leader).',
  inputSchema: z.object({
    vaultCredentials: credField,
  }),
  execute: async ({ vaultCredentials }) => {
    try {
      const result = await vaultRequest(vaultCredentials, '/sys/leader');
      if (!result.ok) return failedResult('Failed to get leader', result);
      return result.data;
    } catch (error) {
      return toVaultError(error, 'Error getting leader');
    }
  },
});
