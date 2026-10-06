// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cronJobRequest, failedResult, toCronJobError } from './client.js';

const tokenField = z.string().optional().describe('cron-job.org API key (injected by system)');

export const cronJobListFolders = tool({
  description: 'List all folders used to organize cron jobs in the account.',
  inputSchema: z.object({
    cronJobApiKey: tokenField,
  }),
  execute: async ({ cronJobApiKey }) => {
    try {
      const result = await cronJobRequest(cronJobApiKey, '/folders');
      if (!result.ok) return failedResult('Failed to list folders', result);
      return result.data;
    } catch (error) {
      return toCronJobError(error, 'Error listing folders');
    }
  },
});

export const cronJobGetFolder = tool({
  description: 'Get details of a folder by folder ID.',
  inputSchema: z.object({
    cronJobApiKey: tokenField,
    folderId: z.number().int().describe('Folder identifier'),
  }),
  execute: async ({ cronJobApiKey, folderId }) => {
    try {
      const result = await cronJobRequest(cronJobApiKey, `/folders/${folderId}`);
      if (!result.ok) return failedResult('Failed to get folder details', result);
      return result.data;
    } catch (error) {
      return toCronJobError(error, 'Error getting folder details');
    }
  },
});

export const cronJobCreateFolder = tool({
  description: 'Create a new folder. Titles must be unique within the account (409 on conflict).',
  inputSchema: z.object({
    cronJobApiKey: tokenField,
    title: z.string().max(128).describe('Folder title (unique, max 128 chars)'),
  }),
  execute: async ({ cronJobApiKey, title }) => {
    try {
      const result = await cronJobRequest(cronJobApiKey, '/folders', {
        method: 'PUT',
        body: { folder: { title } },
      });
      if (!result.ok) return failedResult('Failed to create folder', result);
      return result.data;
    } catch (error) {
      return toCronJobError(error, 'Error creating folder');
    }
  },
});

export const cronJobUpdateFolder = tool({
  description: 'Rename a folder by folder ID. Titles must stay unique within the account.',
  inputSchema: z.object({
    cronJobApiKey: tokenField,
    folderId: z.number().int().describe('Folder identifier'),
    title: z.string().max(128).describe('New folder title'),
  }),
  execute: async ({ cronJobApiKey, folderId, title }) => {
    try {
      const result = await cronJobRequest(cronJobApiKey, `/folders/${folderId}`, {
        method: 'PATCH',
        body: { folder: { title } },
      });
      if (!result.ok) return failedResult('Failed to update folder', result);
      return result.data;
    } catch (error) {
      return toCronJobError(error, 'Error updating folder');
    }
  },
});

export const cronJobDeleteFolder = tool({
  description:
    'Delete a folder by folder ID. Jobs inside are moved to the root folder, not deleted.',
  inputSchema: z.object({
    cronJobApiKey: tokenField,
    folderId: z.number().int().describe('Folder identifier'),
  }),
  execute: async ({ cronJobApiKey, folderId }) => {
    try {
      const result = await cronJobRequest(cronJobApiKey, `/folders/${folderId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete folder', result);
      return result.data;
    } catch (error) {
      return toCronJobError(error, 'Error deleting folder');
    }
  },
});
