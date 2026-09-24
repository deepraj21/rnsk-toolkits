// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
  missingCredentialsError,
  parseSplunkCredentials,
  splunkEntries,
  splunkRequest,
} from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');

export const splunkListDataInputs = tool({
  description: 'List data inputs (monitor, TCP, UDP, script, HTTP) with their collection settings. Use to audit data onboarding.',
  inputSchema: z.object({
    splunkCredentials: authField,
    inputKind: z.enum(['monitor', 'tcp', 'udp', 'script', 'http']).describe('Input type to list'),
    count: z.number().int().min(1).max(1000).optional().describe('Max inputs to return (default 100)'),
  }),
  execute: async ({ splunkCredentials, inputKind, count }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      const data = await splunkRequest(splunkCredentials, `/services/data/inputs/${inputKind}`, {
        query: { count: count ?? 100 },
      });
      const inputs = splunkEntries(data).map((e) => ({ name: e.name, content: e.content }));
      return { count: inputs.length, inputs };
    } catch (error) {
      return { error: 'Failed to list data inputs', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const splunkListHecTokens = tool({
  description: 'List HTTP Event Collector tokens with their allowed indexes. Tokens are ingest credentials — handle as sensitive.',
  inputSchema: z.object({ splunkCredentials: authField }),
  execute: async ({ splunkCredentials }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      const data = await splunkRequest(splunkCredentials, '/services/data/inputs/http');
      const tokens = splunkEntries(data).map((e) => ({
        name: e.name,
        token: (e.content as Record<string, unknown> | undefined)?.token,
        index: (e.content as Record<string, unknown> | undefined)?.index,
        indexes: (e.content as Record<string, unknown> | undefined)?.indexes,
        disabled: (e.content as Record<string, unknown> | undefined)?.disabled,
      }));
      return { count: tokens.length, tokens };
    } catch (error) {
      return { error: 'Failed to list HEC tokens', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const splunkCreateHecToken = tool({
  description: 'Create an HTTP Event Collector token for a new log source. Returns the token value — store it for the sender.',
  inputSchema: z.object({
    splunkCredentials: authField,
    tokenName: z.string().describe('Token/input name'),
    index: z.string().optional().describe('Default index for events via this token'),
    sourcetype: z.string().optional().describe('Default sourcetype'),
    token: z.string().optional().describe('Explicit token value (omit to auto-generate)'),
  }),
  execute: async ({ splunkCredentials, tokenName, index, sourcetype, token }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      return await splunkRequest(splunkCredentials, '/services/data/inputs/http', {
        method: 'POST',
        form: { name: tokenName, index, sourcetype, token },
      });
    } catch (error) {
      return { error: 'Failed to create HEC token', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const splunkSendHecEvent = tool({
  description: 'Send a JSON event to Splunk via HTTP Event Collector. Use to ingest application or test events.',
  inputSchema: z.object({
    splunkCredentials: authField,
    hecToken: z.string().describe('HEC token value (see splunkListHecTokens)'),
    event: z.union([z.record(z.any()), z.string()]).describe('Event payload (object or string)'),
    index: z.string().optional().describe('Target index'),
    sourcetype: z.string().optional().describe('Sourcetype, e.g. "_json"'),
    source: z.string().optional().describe('Source label'),
    host: z.string().optional().describe('Host label'),
    time: z.number().optional().describe('Epoch timestamp (defaults to now)'),
    hecBaseUrl: z.string().optional().describe('HEC base URL, e.g. "https://splunk.example.com:8088" (derived from baseUrl by default)'),
  }),
  execute: async ({ splunkCredentials, hecToken, event, index, sourcetype, source, host, time, hecBaseUrl }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      const base = hecBaseUrl?.replace(/\/+$/, '') ?? parseSplunkCredentials(splunkCredentials).baseUrl.replace(/:8089$/, ':8088');
      const response = await fetch(`${base}/services/collector`, {
        method: 'POST',
        headers: { Authorization: `Splunk ${hecToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, index, sourcetype, source, host, time }),
      });
      const text = await response.text();
      if (!response.ok) {
        return { error: 'Failed to send HEC event', details: text.slice(0, 2000) };
      }
      try {
        return JSON.parse(text);
      } catch {
        return { raw: text };
      }
    } catch (error) {
      return { error: 'Failed to send HEC event', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
