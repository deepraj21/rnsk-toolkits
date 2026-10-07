// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { vaultRequest, failedResult, toVaultError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const vaultListPolicies = tool({
  description: 'List ACL policies (GET /sys/policies/acl?list=true).',
  inputSchema: z.object({
    vaultCredentials: credField,
  }),
  execute: async ({ vaultCredentials }) => {
    try {
      const result = await vaultRequest(vaultCredentials, '/sys/policies/acl', {
        query: { list: true },
      });
      if (!result.ok) return failedResult('Failed to list policies', result);
      return result.data;
    } catch (error) {
      return toVaultError(error, 'Error listing policies');
    }
  },
});

export const vaultReadPolicy = tool({
  description: 'Read an ACL policy document by name (GET /sys/policies/acl/{name}).',
  inputSchema: z.object({
    vaultCredentials: credField,
    name: z.string().describe('Policy name'),
  }),
  execute: async ({ vaultCredentials, name }) => {
    try {
      const result = await vaultRequest(
        vaultCredentials,
        `/sys/policies/acl/${encodeURIComponent(name)}`,
      );
      if (!result.ok) return failedResult('Failed to read policy', result);
      return result.data;
    } catch (error) {
      return toVaultError(error, 'Error reading policy');
    }
  },
});
