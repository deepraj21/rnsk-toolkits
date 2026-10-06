// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cronJobRequest, failedResult, toCronJobError } from './client.js';

const tokenField = z.string().optional().describe('cron-job.org API key (injected by system)');

const scheduleSchema = z
  .object({
    timezone: z.string().optional().describe('IANA timezone, e.g. Europe/Berlin (default UTC)'),
    expiresAt: z
      .number()
      .int()
      .optional()
      .describe('Expiry as YYYYMMDDhhmmss in the job timezone, 0 = never expires'),
    hours: z.array(z.number().int()).optional().describe('Hours 0-23; [-1] = every hour'),
    mdays: z.array(z.number().int()).optional().describe('Days of month 1-31; [-1] = every day'),
    minutes: z.array(z.number().int()).optional().describe('Minutes 0-59; [-1] = every minute'),
    months: z.array(z.number().int()).optional().describe('Months 1-12; [-1] = every month'),
    wdays: z
      .array(z.number().int())
      .optional()
      .describe('Days of week 0=Sunday..6=Saturday; [-1] = every day'),
  })
  .describe('Execution schedule');

const authSchema = z
  .object({
    enable: z.boolean().optional().describe('Enable HTTP basic auth'),
    user: z.string().optional().describe('Basic auth username'),
    password: z.string().optional().describe('Basic auth password'),
  })
  .describe('HTTP basic auth settings');

const notificationSchema = z
  .object({
    onFailure: z.boolean().optional().describe('Notify on job failure'),
    onFailureCount: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('Failures required before notifying'),
    onSuccess: z
      .boolean()
      .optional()
      .describe('Notify when the job succeeds after a prior failure'),
    onDisable: z.boolean().optional().describe('Notify when the job is auto-disabled'),
    onSslCertExpiry: z
      .boolean()
      .optional()
      .describe('Notify when the server TLS certificate is about to expire'),
    onSslCertExpirySeconds: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('Seconds before cert expiry to notify (default 604800)'),
    mode: z
      .number()
      .int()
      .min(0)
      .max(2)
      .optional()
      .describe('0 = no channels, 1 = all channels, 2 = selectedChannels only'),
    selectedChannels: z
      .array(z.number().int())
      .optional()
      .describe('Channel IDs used when mode is 2 (0 = account email)'),
  })
  .describe('Notification settings');

const extendedDataSchema = z
  .object({
    headers: z.record(z.string()).optional().describe('Request headers as key-value pairs'),
    body: z.string().optional().describe('Request body data'),
  })
  .describe('Extended request data');

const jobInputSchema = z.object({
  url: z.string().describe('Job URL (the only mandatory field)'),
  enabled: z.boolean().optional().describe('Whether the job is executed'),
  title: z.string().optional().describe('Job title'),
  saveResponses: z.boolean().optional().describe('Save response headers/body'),
  requestTimeout: z.number().int().optional().describe('Timeout in seconds (-1 = default)'),
  redirectSuccess: z.boolean().optional().describe('Treat 3xx redirects as success'),
  folderId: z.number().int().optional().describe('Folder ID (0 = root folder)'),
  schedule: scheduleSchema.optional(),
  requestMethod: z
    .number()
    .int()
    .min(0)
    .max(8)
    .optional()
    .describe('0=GET, 1=POST, 2=OPTIONS, 3=HEAD, 4=PUT, 5=DELETE, 6=TRACE, 7=CONNECT, 8=PATCH'),
  auth: authSchema.optional(),
  notification: notificationSchema.optional(),
  extendedData: extendedDataSchema.optional(),
});

export const cronJobListJobs = tool({
  description:
    'List all cron jobs in the cron-job.org account with status and next execution times.',
  inputSchema: z.object({
    cronJobApiKey: tokenField,
  }),
  execute: async ({ cronJobApiKey }) => {
    try {
      const result = await cronJobRequest(cronJobApiKey, '/jobs');
      if (!result.ok) return failedResult('Failed to list cron jobs', result);
      return result.data;
    } catch (error) {
      return toCronJobError(error, 'Error listing cron jobs');
    }
  },
});

export const cronJobGetJob = tool({
  description:
    'Get detailed settings of a cron job by job ID, including auth, notifications, and request data.',
  inputSchema: z.object({
    cronJobApiKey: tokenField,
    jobId: z.number().int().describe('Job identifier'),
  }),
  execute: async ({ cronJobApiKey, jobId }) => {
    try {
      const result = await cronJobRequest(cronJobApiKey, `/jobs/${jobId}`);
      if (!result.ok) return failedResult('Failed to get cron job details', result);
      return result.data;
    } catch (error) {
      return toCronJobError(error, 'Error getting cron job details');
    }
  },
});

export const cronJobCreateJob = tool({
  description:
    'Create a new cron job. Only url is mandatory; use [-1] schedule arrays for every minute/hour/day/month/weekday.',
  inputSchema: z.object({
    cronJobApiKey: tokenField,
    job: jobInputSchema,
  }),
  execute: async ({ cronJobApiKey, job }) => {
    try {
      const result = await cronJobRequest(cronJobApiKey, '/jobs', { method: 'PUT', body: { job } });
      if (!result.ok) return failedResult('Failed to create cron job', result);
      return result.data;
    } catch (error) {
      return toCronJobError(error, 'Error creating cron job');
    }
  },
});

export const cronJobUpdateJob = tool({
  description:
    'Update a cron job by job ID. Only include changed fields; omitted fields are left unchanged.',
  inputSchema: z.object({
    cronJobApiKey: tokenField,
    jobId: z.number().int().describe('Job identifier'),
    job: jobInputSchema.partial().describe('Job fields to change, e.g. {enabled: true}'),
  }),
  execute: async ({ cronJobApiKey, jobId, job }) => {
    try {
      const result = await cronJobRequest(cronJobApiKey, `/jobs/${jobId}`, {
        method: 'PATCH',
        body: { job },
      });
      if (!result.ok) return failedResult('Failed to update cron job', result);
      return result.data;
    } catch (error) {
      return toCronJobError(error, 'Error updating cron job');
    }
  },
});

export const cronJobDeleteJob = tool({
  description: 'Delete a cron job by job ID.',
  inputSchema: z.object({
    cronJobApiKey: tokenField,
    jobId: z.number().int().describe('Job identifier'),
  }),
  execute: async ({ cronJobApiKey, jobId }) => {
    try {
      const result = await cronJobRequest(cronJobApiKey, `/jobs/${jobId}`, { method: 'DELETE' });
      if (!result.ok) return failedResult('Failed to delete cron job', result);
      return result.data;
    } catch (error) {
      return toCronJobError(error, 'Error deleting cron job');
    }
  },
});

export const cronJobGetHistory = tool({
  description:
    'Get execution history of a cron job with statuses, durations, and predicted next executions.',
  inputSchema: z.object({
    cronJobApiKey: tokenField,
    jobId: z.number().int().describe('Job identifier'),
  }),
  execute: async ({ cronJobApiKey, jobId }) => {
    try {
      const result = await cronJobRequest(cronJobApiKey, `/jobs/${jobId}/history`);
      if (!result.ok) return failedResult('Failed to get job execution history', result);
      return result.data;
    } catch (error) {
      return toCronJobError(error, 'Error getting job execution history');
    }
  },
});

export const cronJobGetHistoryItem = tool({
  description:
    'Get details of one job execution including response headers and body, by job ID and history identifier.',
  inputSchema: z.object({
    cronJobApiKey: tokenField,
    jobId: z.number().int().describe('Job identifier'),
    identifier: z
      .string()
      .describe('History item identifier from the execution history, e.g. 12345-22-11-4946'),
  }),
  execute: async ({ cronJobApiKey, jobId, identifier }) => {
    try {
      const result = await cronJobRequest(cronJobApiKey, `/jobs/${jobId}/history/${identifier}`);
      if (!result.ok) return failedResult('Failed to get history item details', result);
      return result.data;
    } catch (error) {
      return toCronJobError(error, 'Error getting history item details');
    }
  },
});
