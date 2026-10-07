// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { oktaRequest, failedResult, toOktaError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');
const appIdField = z.string().describe('Application ID');

export const oktaListApps = tool({
  description: 'List applications in the org with optional filter and pagination.',
  inputSchema: z.object({
    oktaCredentials: credField,
    limit: z.number().int().min(1).max(200).optional(),
    after: z.string().optional(),
    filter: z.string().optional().describe('Filter, e.g. status eq "ACTIVE"'),
    q: z.string().optional().describe('Search query string'),
  }),
  execute: async ({ oktaCredentials, limit, after, filter, q }) => {
    try {
      const result = await oktaRequest(oktaCredentials, '/apps', {
        query: { limit, after, filter, q },
      });
      if (!result.ok) return failedResult('Failed to list apps', result);
      return { apps: result.data, link: result.headers.link };
    } catch (error) {
      return toOktaError(error, 'Error listing apps');
    }
  },
});

export const oktaGetApp = tool({
  description: 'Get an application by ID.',
  inputSchema: z.object({
    oktaCredentials: credField,
    appId: appIdField,
  }),
  execute: async ({ oktaCredentials, appId }) => {
    try {
      const result = await oktaRequest(oktaCredentials, `/apps/${encodeURIComponent(appId)}`);
      if (!result.ok) return failedResult('Failed to get app', result);
      return result.data;
    } catch (error) {
      return toOktaError(error, 'Error getting app');
    }
  },
});

export const oktaListAppUsers = tool({
  description: 'List users assigned to an application.',
  inputSchema: z.object({
    oktaCredentials: credField,
    appId: appIdField,
    limit: z.number().int().optional(),
    after: z.string().optional(),
  }),
  execute: async ({ oktaCredentials, appId, limit, after }) => {
    try {
      const result = await oktaRequest(
        oktaCredentials,
        `/apps/${encodeURIComponent(appId)}/users`,
        { query: { limit, after } },
      );
      if (!result.ok) return failedResult('Failed to list app users', result);
      return { users: result.data, link: result.headers.link };
    } catch (error) {
      return toOktaError(error, 'Error listing app users');
    }
  },
});

export const oktaAssignUserToApp = tool({
  description: 'Assign a user to an application with optional profile and credentials.',
  inputSchema: z.object({
    oktaCredentials: credField,
    appId: appIdField,
    userId: z.string().describe('User ID to assign'),
    profile: z.record(z.string(), z.any()).optional().describe('App-specific user profile'),
    credentials: z.record(z.string(), z.any()).optional(),
  }),
  execute: async ({ oktaCredentials, appId, userId, profile, credentials }) => {
    try {
      const result = await oktaRequest(
        oktaCredentials,
        `/apps/${encodeURIComponent(appId)}/users`,
        {
          method: 'POST',
          body: {
            id: userId,
            ...(profile !== undefined ? { profile } : {}),
            ...(credentials !== undefined ? { credentials } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to assign user to app', result);
      return result.data;
    } catch (error) {
      return toOktaError(error, 'Error assigning user to app');
    }
  },
});

export const oktaUnassignUserFromApp = tool({
  description: 'Remove a user assignment from an application.',
  inputSchema: z.object({
    oktaCredentials: credField,
    appId: appIdField,
    userId: z.string().describe('User ID'),
  }),
  execute: async ({ oktaCredentials, appId, userId }) => {
    try {
      const result = await oktaRequest(
        oktaCredentials,
        `/apps/${encodeURIComponent(appId)}/users/${encodeURIComponent(userId)}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to unassign user from app', result);
      return result.data ?? { unassigned: true, appId, userId };
    } catch (error) {
      return toOktaError(error, 'Error unassigning user from app');
    }
  },
});
