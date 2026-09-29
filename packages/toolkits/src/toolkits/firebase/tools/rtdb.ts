// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { getDatabaseUrl, mintAccessToken } from './client.js';

const cred = () =>
  z
    .string()
    .describe('Firebase credentials JSON (projectId, serviceAccountKey, optional databaseUrl)');
const pathField = z
  .string()
  .describe('Database path without leading slash or .json, e.g. users/alice');

function err(label: string, error: unknown) {
  if ((error as any)?.details !== undefined) return error;
  return { error: label, message: error instanceof Error ? error.message : 'Unknown error' };
}

async function rtdbUrl(firebaseCredentials: string, path: string): Promise<string> {
  const token = await mintAccessToken(firebaseCredentials);
  const clean = path.replace(/^\/+/, '').replace(/\.json$/, '');
  return `${getDatabaseUrl(firebaseCredentials)}/${clean}.json?access_token=${encodeURIComponent(token)}`;
}

const quoteIfNeeded = (v: string) => (/^".*"$/.test(v) ? v : JSON.stringify(v));

export const firebaseRtdbGet = tool({
  description: 'Read data from a Realtime Database path. Supports shallow reads and query filters.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    path: pathField,
    shallow: z.boolean().optional().describe('Return keys only instead of values'),
    orderBy: z.string().optional().describe('Order results, e.g. $key, $value, or a child key'),
    limitToFirst: z.number().optional().describe('Limit to first N results (requires orderBy)'),
    limitToLast: z.number().optional().describe('Limit to last N results (requires orderBy)'),
    startAt: z.string().optional().describe('Range start value'),
    endAt: z.string().optional().describe('Range end value'),
    equalTo: z.string().optional().describe('Match a specific value'),
  }),
  execute: async ({
    firebaseCredentials,
    path,
    shallow,
    orderBy,
    limitToFirst,
    limitToLast,
    startAt,
    endAt,
    equalTo,
  }) => {
    try {
      let url = await rtdbUrl(firebaseCredentials, path);
      const params: Record<string, string> = {};
      if (shallow !== undefined) params.shallow = String(shallow);
      if (orderBy) params.orderBy = quoteIfNeeded(orderBy);
      if (limitToFirst !== undefined) params.limitToFirst = String(limitToFirst);
      if (limitToLast !== undefined) params.limitToLast = String(limitToLast);
      if (startAt !== undefined) params.startAt = quoteIfNeeded(startAt);
      if (endAt !== undefined) params.endAt = quoteIfNeeded(endAt);
      if (equalTo !== undefined) params.equalTo = quoteIfNeeded(equalTo);
      const qs = new URLSearchParams(params).toString();
      if (qs) url += `&${qs}`;
      const response = await fetch(url);
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        return { error: 'Realtime Database read failed', status: response.status, details: data };
      return data;
    } catch (error) {
      return err('Failed to read Realtime Database', error);
    }
  },
});

export const firebaseRtdbSet = tool({
  description: 'Write (overwrite) data at a Realtime Database path.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    path: pathField,
    data: z.any().describe('JSON value to write (overwrites existing data at the path)'),
  }),
  execute: async ({ firebaseCredentials, path, data }) => {
    try {
      const url = await rtdbUrl(firebaseCredentials, path);
      const response = await fetch(url, { method: 'PUT', body: JSON.stringify(data) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        return {
          error: 'Realtime Database write failed',
          status: response.status,
          details: result,
        };
      return result;
    } catch (error) {
      return err('Failed to write Realtime Database', error);
    }
  },
});

export const firebaseRtdbUpdate = tool({
  description: 'Update specific children at a Realtime Database path without overwriting siblings.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    path: pathField,
    data: z.record(z.any()).describe('Partial object to merge at the path'),
  }),
  execute: async ({ firebaseCredentials, path, data }) => {
    try {
      const url = await rtdbUrl(firebaseCredentials, path);
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        return {
          error: 'Realtime Database update failed',
          status: response.status,
          details: result,
        };
      return result;
    } catch (error) {
      return err('Failed to update Realtime Database', error);
    }
  },
});

export const firebaseRtdbPush = tool({
  description: 'Append data to a list at a Realtime Database path, generating a unique push key.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    path: pathField,
    data: z.any().describe('JSON value to push (response contains the generated key as "name")'),
  }),
  execute: async ({ firebaseCredentials, path, data }) => {
    try {
      const url = await rtdbUrl(firebaseCredentials, path);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        return { error: 'Realtime Database push failed', status: response.status, details: result };
      return result;
    } catch (error) {
      return err('Failed to push to Realtime Database', error);
    }
  },
});

export const firebaseRtdbDelete = tool({
  description: 'Delete data at a Realtime Database path.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    path: pathField,
  }),
  execute: async ({ firebaseCredentials, path }) => {
    try {
      const url = await rtdbUrl(firebaseCredentials, path);
      const response = await fetch(url, { method: 'DELETE' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        return {
          error: 'Realtime Database delete failed',
          status: response.status,
          details: result,
        };
      return result ?? { deleted: true };
    } catch (error) {
      return err('Failed to delete from Realtime Database', error);
    }
  },
});

export const firebaseRtdbGetRules = tool({
  description: 'Read the Realtime Database security rules.',
  inputSchema: z.object({ firebaseCredentials: cred() }),
  execute: async ({ firebaseCredentials }) => {
    try {
      const url = await rtdbUrl(firebaseCredentials, '.settings/rules');
      const response = await fetch(url);
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        return { error: 'Failed to get security rules', status: response.status, details: data };
      return data;
    } catch (error) {
      return err('Failed to get Realtime Database rules', error);
    }
  },
});
