// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { redisRequest, failedResult, toRedisError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Redis credentials JSON with accountKey and secretKey (Redis Cloud API keys from Access Management)',
  );

export const redisListFixedSubscriptions = tool({
  description: 'List Essentials (fixed-plan) subscriptions.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
  }),
  execute: async ({ redisCredentials }) => {
    try {
      const result = await redisRequest(redisCredentials, '/fixed/subscriptions');
      if (!result.ok) return failedResult('Failed to list Essentials subscriptions', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error listing Essentials subscriptions');
    }
  },
});

export const redisGetFixedSubscription = tool({
  description: 'Get one Essentials subscription.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: z.number().int().describe('Subscription ID'),
  }),
  execute: async ({ redisCredentials, subscriptionId }) => {
    try {
      const result = await redisRequest(redisCredentials, `/fixed/subscriptions/${subscriptionId}`);
      if (!result.ok) return failedResult('Failed to get Essentials subscription', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error getting Essentials subscription');
    }
  },
});

export const redisCreateFixedSubscription = tool({
  description: 'Create an Essentials subscription from a fixed plan.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    name: z.string().describe('Subscription name'),
    planId: z.number().int().describe('Plan ID (see List Plans)'),
    paymentMethodId: z.number().int().optional().describe('Payment method ID'),
  }),
  execute: async ({ redisCredentials, name, planId, paymentMethodId }) => {
    try {
      const result = await redisRequest(redisCredentials, '/fixed/subscriptions', {
        method: 'POST',
        body: {
          name,
          planId,
          ...(paymentMethodId !== undefined ? { paymentMethodId } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create Essentials subscription', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error creating Essentials subscription');
    }
  },
});

export const redisUpdateFixedSubscription = tool({
  description: 'Update an Essentials subscription name or payment method.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: z.number().int().describe('Subscription ID'),
    name: z.string().optional().describe('New subscription name'),
    paymentMethodId: z.number().int().optional().describe('New payment method ID'),
  }),
  execute: async ({ redisCredentials, subscriptionId, name, paymentMethodId }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/fixed/subscriptions/${subscriptionId}`,
        {
          method: 'PUT',
          body: {
            ...(name !== undefined ? { name } : {}),
            ...(paymentMethodId !== undefined ? { paymentMethodId } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to update Essentials subscription', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error updating Essentials subscription');
    }
  },
});

export const redisDeleteFixedSubscription = tool({
  description: 'Delete an Essentials subscription and its databases.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: z.number().int().describe('Subscription ID'),
  }),
  execute: async ({ redisCredentials, subscriptionId }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/fixed/subscriptions/${subscriptionId}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok) return failedResult('Failed to delete Essentials subscription', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error deleting Essentials subscription');
    }
  },
});

export const redisListFixedDatabases = tool({
  description: 'List databases in an Essentials subscription.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: z.number().int().describe('Subscription ID'),
  }),
  execute: async ({ redisCredentials, subscriptionId }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/fixed/subscriptions/${subscriptionId}/databases`,
      );
      if (!result.ok) return failedResult('Failed to list Essentials databases', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error listing Essentials databases');
    }
  },
});

export const redisGetFixedDatabase = tool({
  description: 'Get one Essentials database with endpoint and status.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: z.number().int().describe('Subscription ID'),
    databaseId: z.number().int().describe('Database ID'),
  }),
  execute: async ({ redisCredentials, subscriptionId, databaseId }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/fixed/subscriptions/${subscriptionId}/databases/${databaseId}`,
      );
      if (!result.ok) return failedResult('Failed to get Essentials database', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error getting Essentials database');
    }
  },
});

export const redisCreateFixedDatabase = tool({
  description: 'Create a database in an Essentials subscription.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: z.number().int().describe('Subscription ID'),
    database: z
      .record(z.string(), z.any())
      .describe(
        'Database spec: name (required), memoryLimitInGb, dataPersistence, replication, modules, password, alerts',
      ),
  }),
  execute: async ({ redisCredentials, subscriptionId, database }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/fixed/subscriptions/${subscriptionId}/databases`,
        { method: 'POST', body: database },
      );
      if (!result.ok) return failedResult('Failed to create Essentials database', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error creating Essentials database');
    }
  },
});

export const redisUpdateFixedDatabase = tool({
  description: 'Update an Essentials database (memory, password, alerts, ...).',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: z.number().int().describe('Subscription ID'),
    databaseId: z.number().int().describe('Database ID'),
    database: z.record(z.string(), z.any()).describe('Database fields to update'),
  }),
  execute: async ({ redisCredentials, subscriptionId, databaseId, database }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/fixed/subscriptions/${subscriptionId}/databases/${databaseId}`,
        { method: 'PUT', body: database },
      );
      if (!result.ok) return failedResult('Failed to update Essentials database', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error updating Essentials database');
    }
  },
});

export const redisDeleteFixedDatabase = tool({
  description: 'Delete an Essentials database permanently.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: z.number().int().describe('Subscription ID'),
    databaseId: z.number().int().describe('Database ID'),
  }),
  execute: async ({ redisCredentials, subscriptionId, databaseId }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/fixed/subscriptions/${subscriptionId}/databases/${databaseId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete Essentials database', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error deleting Essentials database');
    }
  },
});

export const redisListFixedBackups = tool({
  description: 'List backups of an Essentials database.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: z.number().int().describe('Subscription ID'),
    databaseId: z.number().int().describe('Database ID'),
  }),
  execute: async ({ redisCredentials, subscriptionId, databaseId }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/fixed/subscriptions/${subscriptionId}/databases/${databaseId}/backup`,
      );
      if (!result.ok) return failedResult('Failed to list Essentials backups', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error listing Essentials backups');
    }
  },
});

export const redisBackupFixedDatabase = tool({
  description: 'Trigger a manual backup of an Essentials database.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: z.number().int().describe('Subscription ID'),
    databaseId: z.number().int().describe('Database ID'),
  }),
  execute: async ({ redisCredentials, subscriptionId, databaseId }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/fixed/subscriptions/${subscriptionId}/databases/${databaseId}/backup`,
        { method: 'POST', body: {} },
      );
      if (!result.ok) return failedResult('Failed to back up Essentials database', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error backing up Essentials database');
    }
  },
});

export const redisImportFixedDatabase = tool({
  description: 'Import data into an Essentials database from backup URIs.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: z.number().int().describe('Subscription ID'),
    databaseId: z.number().int().describe('Database ID'),
    sourceType: z.string().describe('Source type, e.g. ftp, http, aws-s3'),
    importFromUri: z.array(z.string()).min(1).describe('Source URIs of the backup files'),
  }),
  execute: async ({ redisCredentials, subscriptionId, databaseId, sourceType, importFromUri }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/fixed/subscriptions/${subscriptionId}/databases/${databaseId}/import`,
        { method: 'POST', body: { sourceType, importFromUri } },
      );
      if (!result.ok) return failedResult('Failed to import Essentials database', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error importing Essentials database');
    }
  },
});
