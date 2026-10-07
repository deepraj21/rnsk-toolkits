// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { makeRequest, failedResult, toMakeError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Make credentials JSON with baseUrl (zone URL, e.g. https://eu1.make.com) and apiToken',
  );
const hookIdField = z.number().int().describe('Hook ID from Make list hooks');

export const makeCreateHook = tool({
  description:
    'Create a Make webhook or mailhook for a team. The API response omits the bearer-like URL — store it from the returned hook details when needed.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    name: z.string().max(128).describe('Human-readable hook name (max 128 characters)'),
    teamId: z.string().describe('ID of the team that will own the hook'),
    typeName: z.string().describe('Make hook type name, e.g. gateway-webhook'),
    includeMethod: z.boolean().describe('Include incoming HTTP methods in hook data'),
    includeHeaders: z.boolean().describe('Include incoming HTTP headers in hook data'),
    stringify: z.boolean().describe('Return incoming JSON payloads as strings'),
    formId: z.string().optional().describe('Optional provider form ID to associate'),
    connectionId: z.number().int().optional().describe('Optional Make connection ID to associate'),
  }),
  execute: async ({
    makeCredentials,
    name,
    teamId,
    typeName,
    includeMethod,
    includeHeaders,
    stringify,
    formId,
    connectionId,
  }) => {
    try {
      const result = await makeRequest(makeCredentials, '/hooks', {
        method: 'POST',
        body: {
          name,
          teamId,
          typeName,
          method: includeMethod,
          headers: includeHeaders,
          stringify,
          ...(formId !== undefined ? { formId } : {}),
          ...(connectionId !== undefined ? { __IMTCONN__: connectionId } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create hook', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error creating hook');
    }
  },
});

export const makeGetHook = tool({
  description:
    'Retrieve a Make hook by ID without exposing its bearer-like URL, UDID, or relay data.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    hookId: hookIdField,
  }),
  execute: async ({ makeCredentials, hookId }) => {
    try {
      const result = await makeRequest(makeCredentials, `/hooks/${hookId}`);
      if (!result.ok) return failedResult('Failed to get hook', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error getting hook');
    }
  },
});

export const makeGetHookIncomingActivity = tool({
  description:
    'Get webhook queue statistics for a Make hook, or safe metadata for one queued incoming event. Payload values are never returned.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    hookId: hookIdField,
    incomingId: z
      .string()
      .optional()
      .describe('Incoming event ID for per-event metadata; omit for aggregate queue statistics'),
  }),
  execute: async ({ makeCredentials, hookId, incomingId }) => {
    try {
      const path = incomingId
        ? `/hooks/${hookId}/incomings/${incomingId}`
        : `/hooks/${hookId}/incomings/stats`;
      const result = await makeRequest(makeCredentials, path);
      if (!result.ok) return failedResult('Failed to get hook incoming activity', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error getting hook incoming activity');
    }
  },
});

export const makeGetHookLog = tool({
  description:
    'Retrieve safe status and timing diagnostics for one Make webhook execution log. Request headers, URLs, payloads, and response bodies are omitted by the API.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    hookId: hookIdField,
    logId: z.string().describe('Hook execution log ID from List Hook Logs'),
  }),
  execute: async ({ makeCredentials, hookId, logId }) => {
    try {
      const result = await makeRequest(makeCredentials, `/hooks/${hookId}/logs/${logId}`);
      if (!result.ok) return failedResult('Failed to get hook log', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error getting hook log');
    }
  },
});

export const makeListHookLogs = tool({
  description:
    'List execution logs of a Make webhook with optional time range and sorting. Logs are retained 3 days (30 days on Enterprise).',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    hookId: hookIdField,
    fromTimestamp: z
      .number()
      .int()
      .optional()
      .describe('Only logs from this Unix timestamp (in milliseconds) onward'),
    toTimestamp: z
      .number()
      .int()
      .optional()
      .describe('Only logs up to this Unix timestamp (in milliseconds)'),
    sortBy: z.string().optional().describe('Field to sort by'),
    sortDirection: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    limit: z.number().int().min(1).optional().describe('Maximum records to return'),
    offset: z.number().int().min(0).optional().describe('Records to skip'),
  }),
  execute: async ({
    makeCredentials,
    hookId,
    fromTimestamp,
    toTimestamp,
    sortBy,
    sortDirection,
    limit,
    offset,
  }) => {
    try {
      const result = await makeRequest(makeCredentials, `/hooks/${hookId}/logs`, {
        query: {
          from: fromTimestamp,
          to: toTimestamp,
          'pg[sortBy]': sortBy,
          'pg[sortDir]': sortDirection,
          'pg[limit]': limit,
          'pg[offset]': offset,
        },
      });
      if (!result.ok) return failedResult('Failed to list hook logs', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error listing hook logs');
    }
  },
});
