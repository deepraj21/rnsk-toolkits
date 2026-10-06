// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { xRequest, failedResult, toXError } from './client.js';

const tokenField = z.string().optional().describe('X OAuth 2.0 access token (injected by system)');

export const xCreateComplianceJob = tool({
  description:
    'Create a compliance job for post or user IDs. Upload IDs as a plain-text file (one per line) to the upload_url in the response.',
  inputSchema: z.object({
    xToken: tokenField,
    type: z.string().describe("Job type: 'tweets' for post IDs or 'users' for user IDs"),
    name: z.string().optional().describe('Unique job name (max 64 chars)'),
    resumable: z
      .boolean()
      .optional()
      .describe('True to get a pre-signed URL for resumable uploads of large ID lists'),
  }),
  execute: async ({ xToken, type, name, resumable }) => {
    try {
      const result = await xRequest(xToken, '/compliance/jobs', {
        method: 'POST',
        body: {
          type,
          ...(name ? { name } : {}),
          ...(resumable !== undefined ? { resumable } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create compliance job', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error creating compliance job');
    }
  },
});

export const xGetComplianceJob = tool({
  description: 'Get a compliance job by ID.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('Compliance job ID'),
    complianceJobFields: z
      .array(z.string())
      .optional()
      .describe('Fields, e.g. created_at, download_expires_at, download_url, upload_url, status'),
  }),
  execute: async ({ xToken, id, complianceJobFields }) => {
    try {
      const result = await xRequest(xToken, `/compliance/jobs/${id}`, {
        query: { 'compliance_job.fields': complianceJobFields },
      });
      if (!result.ok) return failedResult('Failed to get compliance job', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting compliance job');
    }
  },
});

export const xListComplianceJobs = tool({
  description: 'List compliance jobs filtered by type and status.',
  inputSchema: z.object({
    xToken: tokenField,
    type: z.string().describe("Job type: 'tweets' or 'users'"),
    status: z.string().optional().describe('created, in_progress, failed, or complete'),
    complianceJobFields: z.array(z.string()).optional().describe('Fields to include per job'),
  }),
  execute: async ({ xToken, type, status, complianceJobFields }) => {
    try {
      const result = await xRequest(xToken, '/compliance/jobs', {
        query: { type, status, 'compliance_job.fields': complianceJobFields },
      });
      if (!result.ok) return failedResult('Failed to list compliance jobs', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error listing compliance jobs');
    }
  },
});
