// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { redisRequest, failedResult, toRedisError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Redis credentials JSON with accountKey and secretKey (Redis Cloud API keys from Access Management)',
  );

export const redisListRedisRules = tool({
  description: 'List ACL Redis rules (command/key patterns like Full-Access, Read-Only).',
  inputSchema: z.object({
    redisCredentials: credentialsField,
  }),
  execute: async ({ redisCredentials }) => {
    try {
      const result = await redisRequest(redisCredentials, '/acl/redisRules');
      if (!result.ok) return failedResult('Failed to list Redis rules', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error listing Redis rules');
    }
  },
});

export const redisCreateRedisRule = tool({
  description: 'Create an ACL Redis rule with a Redis ACL string (e.g. "+@read ~*").',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    name: z.string().describe('Rule name'),
    redisRule: z.string().describe('Redis ACL string, e.g. "+@read ~*"'),
  }),
  execute: async ({ redisCredentials, name, redisRule }) => {
    try {
      const result = await redisRequest(redisCredentials, '/acl/redisRules', {
        method: 'POST',
        body: { name, redisRule },
      });
      if (!result.ok) return failedResult('Failed to create Redis rule', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error creating Redis rule');
    }
  },
});

export const redisUpdateRedisRule = tool({
  description: 'Update an ACL Redis rule name or ACL string.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    ruleId: z.number().int().describe('Rule ID'),
    name: z.string().optional().describe('New rule name'),
    redisRule: z.string().optional().describe('New Redis ACL string'),
  }),
  execute: async ({ redisCredentials, ruleId, name, redisRule }) => {
    try {
      const result = await redisRequest(redisCredentials, `/acl/redisRules/${ruleId}`, {
        method: 'PUT',
        body: {
          ...(name !== undefined ? { name } : {}),
          ...(redisRule !== undefined ? { redisRule } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to update Redis rule', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error updating Redis rule');
    }
  },
});

export const redisDeleteRedisRule = tool({
  description: 'Delete an ACL Redis rule.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    ruleId: z.number().int().describe('Rule ID'),
  }),
  execute: async ({ redisCredentials, ruleId }) => {
    try {
      const result = await redisRequest(redisCredentials, `/acl/redisRules/${ruleId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete Redis rule', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error deleting Redis rule');
    }
  },
});

export const redisListAclRoles = tool({
  description: 'List ACL roles binding Redis rules to databases.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
  }),
  execute: async ({ redisCredentials }) => {
    try {
      const result = await redisRequest(redisCredentials, '/acl/roles');
      if (!result.ok) return failedResult('Failed to list ACL roles', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error listing ACL roles');
    }
  },
});

export const redisCreateAclRole = tool({
  description: 'Create an ACL role mapping Redis rules to databases.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    name: z.string().describe('Role name'),
    redisRules: z
      .array(z.record(z.string(), z.any()))
      .min(1)
      .describe('Rules [{ruleName, databases:[{subscriptionId, databaseId, regions:[]}]}]'),
  }),
  execute: async ({ redisCredentials, name, redisRules }) => {
    try {
      const result = await redisRequest(redisCredentials, '/acl/roles', {
        method: 'POST',
        body: { name, redisRules },
      });
      if (!result.ok) return failedResult('Failed to create ACL role', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error creating ACL role');
    }
  },
});

export const redisUpdateAclRole = tool({
  description: 'Update an ACL role name or rule mappings.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    roleId: z.number().int().describe('Role ID'),
    name: z.string().optional().describe('New role name'),
    redisRules: z.array(z.record(z.string(), z.any())).optional().describe('New rule mappings'),
  }),
  execute: async ({ redisCredentials, roleId, name, redisRules }) => {
    try {
      const result = await redisRequest(redisCredentials, `/acl/roles/${roleId}`, {
        method: 'PUT',
        body: {
          ...(name !== undefined ? { name } : {}),
          ...(redisRules !== undefined ? { redisRules } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to update ACL role', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error updating ACL role');
    }
  },
});

export const redisDeleteAclRole = tool({
  description: 'Delete an ACL role.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    roleId: z.number().int().describe('Role ID'),
  }),
  execute: async ({ redisCredentials, roleId }) => {
    try {
      const result = await redisRequest(redisCredentials, `/acl/roles/${roleId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete ACL role', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error deleting ACL role');
    }
  },
});

export const redisListAclUsers = tool({
  description: 'List database ACL users with roles and status.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
  }),
  execute: async ({ redisCredentials }) => {
    try {
      const result = await redisRequest(redisCredentials, '/acl/users');
      if (!result.ok) return failedResult('Failed to list ACL users', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error listing ACL users');
    }
  },
});

export const redisGetAclUser = tool({
  description: 'Get one database ACL user.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    userId: z.number().int().describe('ACL user ID'),
  }),
  execute: async ({ redisCredentials, userId }) => {
    try {
      const result = await redisRequest(redisCredentials, `/acl/users/${userId}`);
      if (!result.ok) return failedResult('Failed to get ACL user', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error getting ACL user');
    }
  },
});

export const redisCreateAclUser = tool({
  description: 'Create a database user with a role and password for least-privilege access.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    name: z.string().describe('Username'),
    role: z.string().describe('ACL role name'),
    password: z.string().describe('User password'),
  }),
  execute: async ({ redisCredentials, name, role, password }) => {
    try {
      const result = await redisRequest(redisCredentials, '/acl/users', {
        method: 'POST',
        body: { name, role, password },
      });
      if (!result.ok) return failedResult('Failed to create ACL user', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error creating ACL user');
    }
  },
});

export const redisUpdateAclUser = tool({
  description: 'Update a database user role or rotate its password.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    userId: z.number().int().describe('ACL user ID'),
    role: z.string().optional().describe('New ACL role name'),
    password: z.string().optional().describe('New password'),
  }),
  execute: async ({ redisCredentials, userId, role, password }) => {
    try {
      const result = await redisRequest(redisCredentials, `/acl/users/${userId}`, {
        method: 'PUT',
        body: {
          ...(role !== undefined ? { role } : {}),
          ...(password !== undefined ? { password } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to update ACL user', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error updating ACL user');
    }
  },
});

export const redisDeleteAclUser = tool({
  description: 'Delete a database ACL user.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    userId: z.number().int().describe('ACL user ID'),
  }),
  execute: async ({ redisCredentials, userId }) => {
    try {
      const result = await redisRequest(redisCredentials, `/acl/users/${userId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete ACL user', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error deleting ACL user');
    }
  },
});

export const redisListUsers = tool({
  description: 'List account users (console access) with roles.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
  }),
  execute: async ({ redisCredentials }) => {
    try {
      const result = await redisRequest(redisCredentials, '/users');
      if (!result.ok) return failedResult('Failed to list account users', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error listing account users');
    }
  },
});

export const redisGetUser = tool({
  description: 'Get one account user.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    userId: z.number().int().describe('User ID'),
  }),
  execute: async ({ redisCredentials, userId }) => {
    try {
      const result = await redisRequest(redisCredentials, `/users/${userId}`);
      if (!result.ok) return failedResult('Failed to get account user', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error getting account user');
    }
  },
});

export const redisUpdateUser = tool({
  description: 'Update an account user name or role (Owner, Viewer, ...).',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    userId: z.number().int().describe('User ID'),
    name: z.string().optional().describe('New display name'),
    role: z.string().optional().describe('New role'),
  }),
  execute: async ({ redisCredentials, userId, name, role }) => {
    try {
      const result = await redisRequest(redisCredentials, `/users/${userId}`, {
        method: 'PUT',
        body: {
          ...(name !== undefined ? { name } : {}),
          ...(role !== undefined ? { role } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to update account user', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error updating account user');
    }
  },
});

export const redisDeleteUser = tool({
  description: 'Delete an account user.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    userId: z.number().int().describe('User ID'),
  }),
  execute: async ({ redisCredentials, userId }) => {
    try {
      const result = await redisRequest(redisCredentials, `/users/${userId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete account user', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error deleting account user');
    }
  },
});

export const redisListCloudAccounts = tool({
  description: 'List cloud provider accounts (BYOC credentials). Use to find cloudAccountId.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
  }),
  execute: async ({ redisCredentials }) => {
    try {
      const result = await redisRequest(redisCredentials, '/cloud-accounts');
      if (!result.ok) return failedResult('Failed to list cloud accounts', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error listing cloud accounts');
    }
  },
});

export const redisGetCloudAccount = tool({
  description: 'Get one cloud account.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    cloudAccountId: z.number().int().describe('Cloud account ID'),
  }),
  execute: async ({ redisCredentials, cloudAccountId }) => {
    try {
      const result = await redisRequest(redisCredentials, `/cloud-accounts/${cloudAccountId}`);
      if (!result.ok) return failedResult('Failed to get cloud account', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error getting cloud account');
    }
  },
});

export const redisCreateCloudAccount = tool({
  description: 'Connect a cloud provider account (AWS IAM user, GCP service account, Azure).',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    name: z.string().describe('Account display name'),
    provider: z.enum(['AWS', 'GCP', 'AZURE']).optional().describe('Cloud provider'),
    accessKeyId: z.string().describe('Provider access key ID'),
    accessSecretKey: z.string().describe('Provider secret key'),
    consoleUsername: z.string().describe('Console username for sign-in'),
    consolePassword: z.string().describe('Console password for sign-in'),
    signInLoginUrl: z.string().describe('Provider sign-in URL'),
  }),
  execute: async ({
    redisCredentials,
    name,
    provider,
    accessKeyId,
    accessSecretKey,
    consoleUsername,
    consolePassword,
    signInLoginUrl,
  }) => {
    try {
      const result = await redisRequest(redisCredentials, '/cloud-accounts', {
        method: 'POST',
        body: {
          name,
          ...(provider !== undefined ? { provider } : {}),
          accessKeyId,
          accessSecretKey,
          consoleUsername,
          consolePassword,
          signInLoginUrl,
        },
      });
      if (!result.ok) return failedResult('Failed to create cloud account', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error creating cloud account');
    }
  },
});

export const redisUpdateCloudAccount = tool({
  description: 'Update cloud account credentials or details.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    cloudAccountId: z.number().int().describe('Cloud account ID'),
    account: z.record(z.string(), z.any()).describe('Account fields to update'),
  }),
  execute: async ({ redisCredentials, cloudAccountId, account }) => {
    try {
      const result = await redisRequest(redisCredentials, `/cloud-accounts/${cloudAccountId}`, {
        method: 'PUT',
        body: account,
      });
      if (!result.ok) return failedResult('Failed to update cloud account', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error updating cloud account');
    }
  },
});

export const redisDeleteCloudAccount = tool({
  description: 'Delete a cloud account connection.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    cloudAccountId: z.number().int().describe('Cloud account ID'),
  }),
  execute: async ({ redisCredentials, cloudAccountId }) => {
    try {
      const result = await redisRequest(redisCredentials, `/cloud-accounts/${cloudAccountId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete cloud account', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error deleting cloud account');
    }
  },
});
