// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { redisRequest, failedResult, toRedisError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Redis credentials JSON with accountKey and secretKey (Redis Cloud API keys from Access Management)',
  );

export const redisGetAccount = tool({
  description: 'Get current account info: ID, name, and owner. Use to verify credentials.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
  }),
  execute: async ({ redisCredentials }) => {
    try {
      const result = await redisRequest(redisCredentials, '/');
      if (!result.ok) return failedResult('Failed to get account', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error getting account');
    }
  },
});

export const redisListPaymentMethods = tool({
  description: 'List payment methods for subscription billing. Use to find paymentMethodId.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
  }),
  execute: async ({ redisCredentials }) => {
    try {
      const result = await redisRequest(redisCredentials, '/payment-methods');
      if (!result.ok) return failedResult('Failed to list payment methods', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error listing payment methods');
    }
  },
});

export const redisListPlans = tool({
  description: 'List Essentials (fixed) plans, optionally filtered by cloud provider.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    provider: z.enum(['AWS', 'GCP', 'AZURE']).optional().describe('Cloud provider filter'),
  }),
  execute: async ({ redisCredentials, provider }) => {
    try {
      const result = await redisRequest(redisCredentials, '/plans', {
        query: { provider },
      });
      if (!result.ok) return failedResult('Failed to list plans', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error listing plans');
    }
  },
});

export const redisListRegions = tool({
  description: 'List cloud regions available for subscriptions.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    provider: z.enum(['AWS', 'GCP', 'AZURE']).optional().describe('Cloud provider filter'),
  }),
  execute: async ({ redisCredentials, provider }) => {
    try {
      const result = await redisRequest(redisCredentials, '/regions', {
        query: { provider },
      });
      if (!result.ok) return failedResult('Failed to list regions', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error listing regions');
    }
  },
});

export const redisListDataPersistences = tool({
  description: 'List available data persistence options for databases.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
  }),
  execute: async ({ redisCredentials }) => {
    try {
      const result = await redisRequest(redisCredentials, '/data-persistence');
      if (!result.ok) return failedResult('Failed to list data persistences', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error listing data persistences');
    }
  },
});

export const redisListDatabaseModules = tool({
  description: 'List available database modules (RedisJSON, RediSearch, TimeSeries, Bloom).',
  inputSchema: z.object({
    redisCredentials: credentialsField,
  }),
  execute: async ({ redisCredentials }) => {
    try {
      const result = await redisRequest(redisCredentials, '/database-modules');
      if (!result.ok) return failedResult('Failed to list database modules', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error listing database modules');
    }
  },
});

export const redisGetLogs = tool({
  description: 'Get account system logs with pagination. Use to audit API and account events.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    limit: z.number().int().min(1).optional().describe('Entries per page'),
    offset: z.number().int().min(0).optional().describe('Entries to skip'),
  }),
  execute: async ({ redisCredentials, limit, offset }) => {
    try {
      const result = await redisRequest(redisCredentials, '/logs', {
        query: { limit, offset },
      });
      if (!result.ok) return failedResult('Failed to get logs', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error getting logs');
    }
  },
});

export const redisGetSessionLogs = tool({
  description: 'Get session (login) logs for the account.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
  }),
  execute: async ({ redisCredentials }) => {
    try {
      const result = await redisRequest(redisCredentials, '/session-logs');
      if (!result.ok) return failedResult('Failed to get session logs', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error getting session logs');
    }
  },
});

export const redisListTasks = tool({
  description: 'List async API tasks with statuses. Use to track long-running operations.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
  }),
  execute: async ({ redisCredentials }) => {
    try {
      const result = await redisRequest(redisCredentials, '/tasks');
      if (!result.ok) return failedResult('Failed to list tasks', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error listing tasks');
    }
  },
});

export const redisGetTask = tool({
  description: 'Get one async task with status, response, and error details.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    taskId: z.string().describe('Task ID from a mutating call'),
  }),
  execute: async ({ redisCredentials, taskId }) => {
    try {
      const result = await redisRequest(redisCredentials, `/tasks/${taskId}`);
      if (!result.ok) return failedResult('Failed to get task', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error getting task');
    }
  },
});

export const redisCreateCostReport = tool({
  description: 'Request a cost report in FOCUS format for a time range.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    report: z
      .record(z.string(), z.any())
      .describe('Cost report spec: period, granularity, dimensions, format'),
  }),
  execute: async ({ redisCredentials, report }) => {
    try {
      const result = await redisRequest(redisCredentials, '/cost-report', {
        method: 'POST',
        body: report,
      });
      if (!result.ok) return failedResult('Failed to create cost report', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error creating cost report');
    }
  },
});

export const redisGetCostReport = tool({
  description: 'Get a cost report request status and download link.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    costReportId: z.string().describe('Cost report ID'),
  }),
  execute: async ({ redisCredentials, costReportId }) => {
    try {
      const result = await redisRequest(redisCredentials, `/cost-report/${costReportId}`);
      if (!result.ok) return failedResult('Failed to get cost report', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error getting cost report');
    }
  },
});
