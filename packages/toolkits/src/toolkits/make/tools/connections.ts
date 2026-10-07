// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { makeRequest, failedResult, toMakeError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Make credentials JSON with baseUrl (zone URL, e.g. https://eu1.make.com) and apiToken',
  );

export const makeGetConnection = tool({
  description: 'Retrieve one Make connection by ID with optional selected columns.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    connectionId: z.number().int().describe('Connection ID to retrieve'),
    columns: z.array(z.string()).optional().describe('Connection fields to include'),
  }),
  execute: async ({ makeCredentials, connectionId, columns }) => {
    try {
      const result = await makeRequest(makeCredentials, `/connections/${connectionId}`, {
        query: { 'cols[]': columns },
      });
      if (!result.ok) return failedResult('Failed to get connection', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error getting connection');
    }
  },
});

export const makeListConnections = tool({
  description: 'List the connections belonging to a Make team.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    teamId: z.number().int().describe('Team ID whose connections to list'),
    columns: z.array(z.string()).optional().describe('Connection fields to include'),
    connectionTypes: z.array(z.string()).optional().describe('Connection types to include'),
  }),
  execute: async ({ makeCredentials, teamId, columns, connectionTypes }) => {
    try {
      const result = await makeRequest(makeCredentials, '/connections', {
        query: { teamId, 'cols[]': columns, 'type[]': connectionTypes },
      });
      if (!result.ok) return failedResult('Failed to list connections', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error listing connections');
    }
  },
});

export const makeGetCurrentUser = tool({
  description:
    'Retrieve information about the current authenticated Make user: ID, name, email, timezone, and support eligibility.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
  }),
  execute: async ({ makeCredentials }) => {
    try {
      const result = await makeRequest(makeCredentials, '/users/me');
      if (!result.ok) return failedResult('Failed to get current user', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error getting current user');
    }
  },
});

export const makeGetCurrentAuthorization = tool({
  description:
    'Retrieve current authorization details: permission scopes and authentication method. Use after authentication to verify token capabilities.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
  }),
  execute: async ({ makeCredentials }) => {
    try {
      const result = await makeRequest(makeCredentials, '/users/me/current-authorization');
      if (!result.ok) return failedResult('Failed to get current authorization', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error getting current authorization');
    }
  },
});

export const makeCreatePasswordResetDemand = tool({
  description:
    'Trigger a password reset email for a Make user by email address. Use when a user needs to reset their password.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    email: z.string().email().describe('Email of the user to reset the password for'),
  }),
  execute: async ({ makeCredentials, email }) => {
    try {
      const result = await makeRequest(makeCredentials, '/users/password-reset-demand', {
        method: 'POST',
        body: { email },
      });
      if (!result.ok) return failedResult('Failed to create password reset demand', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error creating password reset demand');
    }
  },
});

export const makePing = tool({
  description:
    'Verify Make API connectivity and token validity by fetching the current authenticated user. Use as a connection health check.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
  }),
  execute: async ({ makeCredentials }) => {
    try {
      const result = await makeRequest(makeCredentials, '/users/me');
      if (!result.ok) return failedResult('Failed to ping Make API', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error pinging Make API');
    }
  },
});

export const makeSetSdkConnectionApi = tool({
  description:
    'Set the API (authorization) section of a Make custom-app SDK connection by name. Use when developing custom apps to configure how the connection authorizes. Requires sdk-apps:write scope.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    connectionName: z.string().describe('SDK connection name'),
    apiDefinition: z
      .record(z.string(), z.any())
      .describe('API section definition (authorize/token/info/invalidate objects)'),
  }),
  execute: async ({ makeCredentials, connectionName, apiDefinition }) => {
    try {
      const result = await makeRequest(
        makeCredentials,
        `/sdk/apps/connections/${connectionName}/api`,
        { method: 'PUT', body: apiDefinition },
      );
      if (!result.ok) return failedResult('Failed to set SDK connection API', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error setting SDK connection API');
    }
  },
});
