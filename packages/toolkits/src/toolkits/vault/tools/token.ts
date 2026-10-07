// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { vaultRequest, failedResult, toVaultError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const vaultLookupSelf = tool({
  description: 'Look up the current token (policies, TTL, metadata) via /auth/token/lookup-self.',
  inputSchema: z.object({
    vaultCredentials: credField,
  }),
  execute: async ({ vaultCredentials }) => {
    try {
      const result = await vaultRequest(vaultCredentials, '/auth/token/lookup-self', {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to lookup token', result);
      return result.data;
    } catch (error) {
      return toVaultError(error, 'Error looking up token');
    }
  },
});

export const vaultRenewSelf = tool({
  description: 'Renew the current token lease (POST /auth/token/renew-self).',
  inputSchema: z.object({
    vaultCredentials: credField,
    increment: z
      .string()
      .optional()
      .describe('Requested lease extension, e.g. 3600s (server may cap)'),
  }),
  execute: async ({ vaultCredentials, increment }) => {
    try {
      const result = await vaultRequest(vaultCredentials, '/auth/token/renew-self', {
        method: 'POST',
        body: increment !== undefined ? { increment } : {},
      });
      if (!result.ok) return failedResult('Failed to renew token', result);
      return result.data;
    } catch (error) {
      return toVaultError(error, 'Error renewing token');
    }
  },
});

export const vaultRevokeSelf = tool({
  description: 'Revoke the current token (POST /auth/token/revoke-self).',
  inputSchema: z.object({
    vaultCredentials: credField,
  }),
  execute: async ({ vaultCredentials }) => {
    try {
      const result = await vaultRequest(vaultCredentials, '/auth/token/revoke-self', {
        method: 'POST',
      });
      if (!result.ok) return failedResult('Failed to revoke token', result);
      return result.data ?? { revoked: true };
    } catch (error) {
      return toVaultError(error, 'Error revoking token');
    }
  },
});

export const vaultAppRoleLogin = tool({
  description:
    'Exchange AppRole role_id and secret_id for a client token (POST /auth/approle/login). Prefer storing roleId/secretId in connect credentials so other tools login automatically.',
  inputSchema: z.object({
    vaultCredentials: credField,
    roleId: z.string().optional().describe('Overrides roleId in credentials'),
    secretId: z.string().optional().describe('Overrides secretId in credentials'),
  }),
  execute: async ({ vaultCredentials, roleId, secretId }) => {
    try {
      let credsJson: Record<string, string> = {};
      if (vaultCredentials) {
        try {
          credsJson = JSON.parse(vaultCredentials);
        } catch {
          return { error: 'Invalid vaultCredentials JSON' };
        }
      }
      const rid = roleId ?? credsJson.roleId;
      const sid = secretId ?? credsJson.secretId;
      if (!rid || !sid) {
        return {
          error: 'roleId and secretId are required (in tool args or vaultCredentials JSON)',
        };
      }
      const mergedObj: Record<string, string> = { ...credsJson, roleId: rid, secretId: sid };
      delete mergedObj.token;
      const merged = JSON.stringify(mergedObj);
      const result = await vaultRequest(merged, '/auth/approle/login', {
        method: 'POST',
        body: { role_id: rid, secret_id: sid },
        skipAuth: true,
      });
      if (!result.ok) return failedResult('AppRole login failed', result);
      return result.data;
    } catch (error) {
      return toVaultError(error, 'Error during AppRole login');
    }
  },
});
