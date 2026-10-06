// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { intercomRequest, failedResult, toIntercomError } from './client.js';

export const intercomCreateTag = tool({
  description: 'Create or update a tag, optionally tagging users and companies.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    name: z.string(),
    id: z.string().optional().describe('existing tag ID to update'),
    users: z
      .array(z.object({ id: z.string() }))
      .optional()
      .describe('users to tag, each with id'),
    companies: z
      .array(z.object({ id: z.string().optional(), companyId: z.string().optional() }))
      .optional()
      .describe('each with id or companyId, untag to remove'),
  }),
  execute: async ({ intercomCredentials, name, id, users, companies }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/tags`, {
        method: 'POST',
        body: { name, id, users, companies },
      });
      if (!result.ok) return failedResult('Failed to create tag', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error creating tag');
    }
  },
});

export const intercomFindTag = tool({
  description: 'Fetch a tag by ID.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    tagId: z.string(),
  }),
  execute: async ({ intercomCredentials, tagId }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/tags/${tagId}`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to find tag', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error find tag');
    }
  },
});

export const intercomListTags = tool({
  description: 'Fetch all workspace tags.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
  }),
  execute: async ({ intercomCredentials }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/tags`, { method: 'GET' });
      if (!result.ok) return failedResult('Failed to list tags', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing tags');
    }
  },
});

export const intercomDeleteTag = tool({
  description: 'Permanently delete a tag from the workspace.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    tagId: z.string(),
  }),
  execute: async ({ intercomCredentials, tagId }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/tags/${tagId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete tag', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error deleting tag');
    }
  },
});
