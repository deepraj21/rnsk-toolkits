// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { redisRequest, failedResult, toRedisError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Redis credentials JSON with accountKey and secretKey (Redis Cloud API keys from Access Management)',
  );
const subIdField = z.number().int().describe('Subscription ID');
const dbIdField = z.number().int().describe('Database ID');

export const redisListSubscriptions = tool({
  description: 'List Pro subscriptions with status, cloud, and databases summary.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
  }),
  execute: async ({ redisCredentials }) => {
    try {
      const result = await redisRequest(redisCredentials, '/subscriptions');
      if (!result.ok) return failedResult('Failed to list subscriptions', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error listing subscriptions');
    }
  },
});

export const redisGetSubscription = tool({
  description: 'Get one Pro subscription with providers, regions, and databases.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: subIdField,
  }),
  execute: async ({ redisCredentials, subscriptionId }) => {
    try {
      const result = await redisRequest(redisCredentials, `/subscriptions/${subscriptionId}`);
      if (!result.ok) return failedResult('Failed to get subscription', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error getting subscription');
    }
  },
});

export const redisCreateSubscription = tool({
  description:
    'Create a Pro subscription on AWS/GCP/Azure with providers, regions, payment method, and initial databases.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    name: z.string().optional().describe('Subscription name'),
    paymentMethodId: z
      .number()
      .int()
      .optional()
      .describe('Payment method ID (see List Payment Methods)'),
    cloudProviders: z
      .array(z.record(z.string(), z.any()))
      .min(1)
      .describe(
        'Providers [{cloudAccountId, regions:[{region, networking:{deploymentCIDR}}}]}]; cloudAccountId 1 uses internal resources',
      ),
    databases: z
      .array(z.record(z.string(), z.any()))
      .min(1)
      .describe('Initial databases [{name, memoryLimitInGb, ...}]'),
    dryRun: z.boolean().optional().describe('Validate without creating'),
  }),
  execute: async ({
    redisCredentials,
    name,
    paymentMethodId,
    cloudProviders,
    databases,
    dryRun,
  }) => {
    try {
      const result = await redisRequest(redisCredentials, '/subscriptions', {
        method: 'POST',
        body: {
          ...(name !== undefined ? { name } : {}),
          ...(paymentMethodId !== undefined ? { paymentMethodId } : {}),
          cloudProviders,
          databases,
          ...(dryRun !== undefined ? { dryRun } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create subscription', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error creating subscription');
    }
  },
});

export const redisUpdateSubscription = tool({
  description: 'Update a Pro subscription name or payment method.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: subIdField,
    name: z.string().optional().describe('New subscription name'),
    paymentMethodId: z.number().int().optional().describe('New payment method ID'),
  }),
  execute: async ({ redisCredentials, subscriptionId, name, paymentMethodId }) => {
    try {
      const result = await redisRequest(redisCredentials, `/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        body: {
          ...(name !== undefined ? { name } : {}),
          ...(paymentMethodId !== undefined ? { paymentMethodId } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to update subscription', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error updating subscription');
    }
  },
});

export const redisDeleteSubscription = tool({
  description: 'Delete a subscription and all its databases. Must be empty of databases first.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: subIdField,
  }),
  execute: async ({ redisCredentials, subscriptionId }) => {
    try {
      const result = await redisRequest(redisCredentials, `/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete subscription', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error deleting subscription');
    }
  },
});

export const redisGetSubscriptionCidr = tool({
  description: 'Get the deployment CIDR whitelist of a subscription for network security.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: subIdField,
  }),
  execute: async ({ redisCredentials, subscriptionId }) => {
    try {
      const result = await redisRequest(redisCredentials, `/subscriptions/${subscriptionId}/cidr`);
      if (!result.ok) return failedResult('Failed to get subscription CIDR', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error getting subscription CIDR');
    }
  },
});

export const redisUpdateSubscriptionCidr = tool({
  description: 'Set the deployment CIDR whitelist of a subscription.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: subIdField,
    deploymentCidr: z.string().describe('CIDR block, e.g. 10.0.0.0/24'),
  }),
  execute: async ({ redisCredentials, subscriptionId, deploymentCidr }) => {
    try {
      const result = await redisRequest(redisCredentials, `/subscriptions/${subscriptionId}/cidr`, {
        method: 'PUT',
        body: { deploymentCidr },
      });
      if (!result.ok) return failedResult('Failed to update subscription CIDR', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error updating subscription CIDR');
    }
  },
});

export const redisGetSubscriptionPricing = tool({
  description: 'Get pricing estimate for a subscription configuration.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: subIdField,
  }),
  execute: async ({ redisCredentials, subscriptionId }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/pricing`,
      );
      if (!result.ok) return failedResult('Failed to get subscription pricing', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error getting subscription pricing');
    }
  },
});

export const redisGetMaintenanceWindows = tool({
  description: 'Get maintenance windows of a subscription.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: subIdField,
  }),
  execute: async ({ redisCredentials, subscriptionId }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/maintenance-windows`,
      );
      if (!result.ok) return failedResult('Failed to get maintenance windows', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error getting maintenance windows');
    }
  },
});

export const redisUpdateMaintenanceWindows = tool({
  description: 'Set maintenance windows of a subscription.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: subIdField,
    windows: z
      .array(z.record(z.string(), z.any()))
      .min(1)
      .describe('Windows [{mode, window:[{startHour, durationInHours, days}]}]'),
  }),
  execute: async ({ redisCredentials, subscriptionId, windows }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/maintenance-windows`,
        { method: 'PUT', body: windows },
      );
      if (!result.ok) return failedResult('Failed to update maintenance windows', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error updating maintenance windows');
    }
  },
});

export const redisListDatabases = tool({
  description: 'List databases in a Pro subscription with status and endpoints summary.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: subIdField,
  }),
  execute: async ({ redisCredentials, subscriptionId }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/databases`,
      );
      if (!result.ok) return failedResult('Failed to list databases', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error listing databases');
    }
  },
});

export const redisGetDatabase = tool({
  description:
    'Get one database with endpoints, credentials reference, memory, persistence, modules, and status.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: subIdField,
    databaseId: dbIdField,
  }),
  execute: async ({ redisCredentials, subscriptionId, databaseId }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/databases/${databaseId}`,
      );
      if (!result.ok) return failedResult('Failed to get database', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error getting database');
    }
  },
});

const databaseCreateField = z
  .record(z.string(), z.any())
  .describe(
    'Database spec: name (required), protocol, port, memoryLimitInGb, dataPersistence, dataEvictionPolicy, replication, throughputMeasurement {by, value}, modules [{name: RedisJSON|RediSearch|RedisTimeSeries|RedisBloom}], password, sourceIp, alerts, enableTls, supportOSSClusterApi',
  );

export const redisCreateDatabase = tool({
  description:
    'Create a database in a Pro subscription. Name is required; tune memory, persistence, modules, and throughput.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: subIdField,
    database: databaseCreateField,
    dryRun: z.boolean().optional().describe('Validate without creating'),
  }),
  execute: async ({ redisCredentials, subscriptionId, database, dryRun }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/databases`,
        {
          method: 'POST',
          body: { ...database, ...(dryRun !== undefined ? { dryRun } : {}) },
        },
      );
      if (!result.ok) return failedResult('Failed to create database', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error creating database');
    }
  },
});

export const redisUpdateDatabase = tool({
  description:
    'Update a database: memory, throughput, persistence, password, alerts, TLS, clustering flags.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: subIdField,
    databaseId: dbIdField,
    database: z.record(z.string(), z.any()).describe('Database fields to update'),
    dryRun: z.boolean().optional().describe('Validate without updating'),
  }),
  execute: async ({ redisCredentials, subscriptionId, databaseId, database, dryRun }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/databases/${databaseId}`,
        {
          method: 'PUT',
          body: { ...database, ...(dryRun !== undefined ? { dryRun } : {}) },
        },
      );
      if (!result.ok) return failedResult('Failed to update database', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error updating database');
    }
  },
});

export const redisDeleteDatabase = tool({
  description: 'Delete a database permanently. Export a backup first.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: subIdField,
    databaseId: dbIdField,
  }),
  execute: async ({ redisCredentials, subscriptionId, databaseId }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/databases/${databaseId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete database', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error deleting database');
    }
  },
});

export const redisListBackups = tool({
  description: 'List available backups of a database.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: subIdField,
    databaseId: dbIdField,
  }),
  execute: async ({ redisCredentials, subscriptionId, databaseId }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/databases/${databaseId}/backup`,
      );
      if (!result.ok) return failedResult('Failed to list backups', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error listing backups');
    }
  },
});

export const redisBackupDatabase = tool({
  description: 'Trigger a manual backup of a database (region and ad-hoc path optional).',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: subIdField,
    databaseId: dbIdField,
    regionName: z.string().optional().describe('Region for the backup'),
    adhocBackupPath: z.string().optional().describe('Custom backup destination path'),
  }),
  execute: async ({
    redisCredentials,
    subscriptionId,
    databaseId,
    regionName,
    adhocBackupPath,
  }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/databases/${databaseId}/backup`,
        {
          method: 'POST',
          body: {
            ...(regionName !== undefined ? { regionName } : {}),
            ...(adhocBackupPath !== undefined ? { adhocBackupPath } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to back up database', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error backing up database');
    }
  },
});

export const redisImportDatabase = tool({
  description: 'Import data into a database from RDB backup URIs (FTP/HTTP/S3).',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: subIdField,
    databaseId: dbIdField,
    sourceType: z.string().describe('Source type, e.g. ftp, http, aws-s3'),
    importFromUri: z.array(z.string()).min(1).describe('Source URIs of the backup files'),
  }),
  execute: async ({ redisCredentials, subscriptionId, databaseId, sourceType, importFromUri }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/databases/${databaseId}/import`,
        { method: 'POST', body: { sourceType, importFromUri } },
      );
      if (!result.ok) return failedResult('Failed to import database', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error importing database');
    }
  },
});

export const redisFlushDatabase = tool({
  description: 'Flush all data from a database (keeps configuration). Cannot be undone.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: subIdField,
    databaseId: dbIdField,
  }),
  execute: async ({ redisCredentials, subscriptionId, databaseId }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/databases/${databaseId}/flush`,
        { method: 'PUT', body: {} },
      );
      if (!result.ok) return failedResult('Failed to flush database', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error flushing database');
    }
  },
});

export const redisGetDatabaseCertificate = tool({
  description: 'Get the TLS certificate of a database for client trust stores.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: subIdField,
    databaseId: dbIdField,
  }),
  execute: async ({ redisCredentials, subscriptionId, databaseId }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/databases/${databaseId}/certificate`,
      );
      if (!result.ok) return failedResult('Failed to get database certificate', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error getting database certificate');
    }
  },
});

export const redisGetSlowLog = tool({
  description: 'Get the slow log of a database for performance debugging.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: subIdField,
    databaseId: dbIdField,
  }),
  execute: async ({ redisCredentials, subscriptionId, databaseId }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/databases/${databaseId}/slow-log`,
      );
      if (!result.ok) return failedResult('Failed to get slow log', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error getting slow log');
    }
  },
});

export const redisGetDatabaseTags = tool({
  description: 'Get resource tags of a database.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: subIdField,
    databaseId: dbIdField,
  }),
  execute: async ({ redisCredentials, subscriptionId, databaseId }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/databases/${databaseId}/tags`,
      );
      if (!result.ok) return failedResult('Failed to get database tags', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error getting database tags');
    }
  },
});

export const redisUpdateDatabaseTags = tool({
  description: 'Add or update resource tags of a database.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: subIdField,
    databaseId: dbIdField,
    tags: z.record(z.string(), z.string()).describe('Tags as key/value pairs'),
  }),
  execute: async ({ redisCredentials, subscriptionId, databaseId, tags }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/databases/${databaseId}/tags`,
        { method: 'POST', body: tags },
      );
      if (!result.ok) return failedResult('Failed to update database tags', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error updating database tags');
    }
  },
});

export const redisDeleteDatabaseTag = tool({
  description: 'Delete one resource tag of a database.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: subIdField,
    databaseId: dbIdField,
    tagKey: z.string().describe('Tag key to delete'),
  }),
  execute: async ({ redisCredentials, subscriptionId, databaseId, tagKey }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/databases/${databaseId}/tags/${tagKey}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete database tag', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error deleting database tag');
    }
  },
});
