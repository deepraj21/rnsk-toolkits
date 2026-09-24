// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { missingCredentialsError, splunkEntries, splunkRequest } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');

const GENERATING_COMMANDS = [
  'search', 'inputlookup', 'inputcsv', 'rest', 'makeresults', 'gentimes', 'pivot',
  'datamodel', 'tstats', 'mstats', 'from', 'dbxquery', 'union', 'loadjob',
];

/** Splunk ad-hoc searches must start with `search` unless they use a generating command. */
function normalizeSearch(search: string): string {
  const trimmed = search.trim();
  if (trimmed.startsWith('|')) return `search ${trimmed}`;
  const first = trimmed.split(/[\s|]/, 1)[0].toLowerCase();
  if (GENERATING_COMMANDS.includes(first)) return trimmed;
  return `search ${trimmed}`;
}

function summarizeJob(entry: { name?: string; content?: Record<string, unknown> }) {
  const c = entry.content ?? {};
  return {
    sid: entry.name,
    search: c.eventSearch ?? c.search,
    dispatchState: c.dispatchState,
    doneProgress: c.doneProgress,
    isDone: c.isDone,
    isFailed: c.isFailed,
    eventCount: c.eventCount,
    resultCount: c.resultCount,
  };
}

export const splunkCreateSearchJob = tool({
  description: 'Run an SPL search as an async job. Returns a sid — poll status, then fetch results. Defaults to the last 24 hours.',
  inputSchema: z.object({
    splunkCredentials: authField,
    search: z.string().describe('SPL search, e.g. "index=main error | stats count by host" ("search" prefix is added automatically)'),
    earliestTime: z.string().optional().describe('Start of time range, e.g. "-24h", "-7d@d" (default "-24h")'),
    latestTime: z.string().optional().describe('End of time range, e.g. "now" (default "now")'),
    maxCount: z.number().int().min(1).optional().describe('Max events to return (default 10000)'),
    execMode: z.enum(['normal', 'blocking']).optional().describe('normal returns immediately; blocking waits for completion'),
  }),
  execute: async ({ splunkCredentials, search, earliestTime, latestTime, maxCount, execMode }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      const data = (await splunkRequest(splunkCredentials, '/services/search/jobs', {
        method: 'POST',
        form: {
          search: normalizeSearch(search),
          earliest_time: earliestTime ?? '-24h',
          latest_time: latestTime ?? 'now',
          max_count: maxCount,
          exec_mode: execMode ?? 'normal',
        },
      })) as { sid?: string };
      return { sid: data.sid };
    } catch (error) {
      return { error: 'Failed to create search job', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const splunkGetSearchJobStatus = tool({
  description: 'Check an SPL search job state and progress. Use to poll until dispatchState is DONE before fetching results.',
  inputSchema: z.object({
    splunkCredentials: authField,
    sid: z.string().describe('Search job ID returned by splunkCreateSearchJob'),
  }),
  execute: async ({ splunkCredentials, sid }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      const data = (await splunkRequest(splunkCredentials, `/services/search/jobs/${encodeURIComponent(sid)}`)) as {
        entry?: { content?: Record<string, unknown> };
      };
      const c = data.entry?.content ?? {};
      return {
        sid,
        dispatchState: c.dispatchState,
        doneProgress: c.doneProgress,
        isDone: c.isDone,
        isFailed: c.isFailed,
        eventCount: c.eventCount,
        resultCount: c.resultCount,
        runDuration: c.runDuration,
        messages: c.messages,
      };
    } catch (error) {
      return { error: 'Failed to get search job status', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const splunkGetSearchJobResults = tool({
  description: 'Fetch transformed results of a completed search job with pagination. Use after status shows DONE.',
  inputSchema: z.object({
    splunkCredentials: authField,
    sid: z.string().describe('Search job ID'),
    count: z.number().int().min(0).max(50000).optional().describe('Max results to return (0 = all, default 100)'),
    offset: z.number().int().min(0).optional().describe('Result offset for pagination'),
    fieldList: z.string().optional().describe('Comma-separated fields to return, e.g. "host,source,_time"'),
  }),
  execute: async ({ splunkCredentials, sid, count, offset, fieldList }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      return await splunkRequest(splunkCredentials, `/services/search/jobs/${encodeURIComponent(sid)}/results`, {
        query: { count: count ?? 100, offset, field_list: fieldList },
      });
    } catch (error) {
      return { error: 'Failed to get search job results', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const splunkGetSearchJobEvents = tool({
  description: 'Fetch raw untransformed events of a search job (available while it still runs). Use for raw log inspection.',
  inputSchema: z.object({
    splunkCredentials: authField,
    sid: z.string().describe('Search job ID'),
    count: z.number().int().min(0).max(50000).optional().describe('Max events to return (0 = all, default 100)'),
    offset: z.number().int().min(0).optional().describe('Event offset for pagination'),
  }),
  execute: async ({ splunkCredentials, sid, count, offset }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      return await splunkRequest(splunkCredentials, `/services/search/jobs/${encodeURIComponent(sid)}/events`, {
        query: { count: count ?? 100, offset },
      });
    } catch (error) {
      return { error: 'Failed to get search job events', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const splunkRunOneShotSearch = tool({
  description: 'Run a short SPL search synchronously and get results directly. Use for quick lookups; prefer async jobs for long searches.',
  inputSchema: z.object({
    splunkCredentials: authField,
    search: z.string().describe('SPL search ("search" prefix is added automatically)'),
    earliestTime: z.string().optional().describe('Start of time range (default "-24h")'),
    latestTime: z.string().optional().describe('End of time range (default "now")'),
    count: z.number().int().min(1).max(50000).optional().describe('Max results (default 100)'),
  }),
  execute: async ({ splunkCredentials, search, earliestTime, latestTime, count }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      return await splunkRequest(splunkCredentials, '/services/search/jobs', {
        method: 'POST',
        form: {
          search: normalizeSearch(search),
          earliest_time: earliestTime ?? '-24h',
          latest_time: latestTime ?? 'now',
          count: count ?? 100,
          exec_mode: 'oneshot',
        },
      });
    } catch (error) {
      return { error: 'Failed to run one-shot search', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const splunkExportSearch = tool({
  description: 'Stream SPL search results as they become available (no sid). Use for large result sets and long-running searches.',
  inputSchema: z.object({
    splunkCredentials: authField,
    search: z.string().describe('SPL search ("search" prefix is added automatically)'),
    earliestTime: z.string().optional().describe('Start of time range (default "-24h")'),
    latestTime: z.string().optional().describe('End of time range (default "now")'),
    count: z.number().int().min(0).optional().describe('Max results (0 = all, default 1000)'),
  }),
  execute: async ({ splunkCredentials, search, earliestTime, latestTime, count }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      const text = (await splunkRequest(splunkCredentials, '/services/search/jobs/export', {
        query: {
          search: normalizeSearch(search),
          earliest_time: earliestTime ?? '-24h',
          latest_time: latestTime ?? 'now',
          count: count ?? 1000,
        },
        rawText: true,
      })) as string;
      const results: unknown[] = [];
      for (const line of text.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          results.push(JSON.parse(trimmed));
        } catch {
          return { results: undefined, raw: text.slice(0, 10000) };
        }
      }
      return { count: results.length, results };
    } catch (error) {
      return { error: 'Failed to export search', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const splunkListSearchJobs = tool({
  description: 'List recent search jobs for the connected user with state and progress. Use to find lost sids or audit search activity.',
  inputSchema: z.object({
    splunkCredentials: authField,
    count: z.number().int().min(1).max(1000).optional().describe('Max jobs to return (default 30)'),
  }),
  execute: async ({ splunkCredentials, count }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      const data = await splunkRequest(splunkCredentials, '/services/search/jobs', {
        query: { count: count ?? 30 },
      });
      const jobs = splunkEntries(data).map(summarizeJob);
      return { count: jobs.length, jobs };
    } catch (error) {
      return { error: 'Failed to list search jobs', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const splunkCancelSearchJob = tool({
  description: 'Cancel and delete a search job, freeing its resources. Use to stop runaway or unwanted searches.',
  inputSchema: z.object({
    splunkCredentials: authField,
    sid: z.string().describe('Search job ID to cancel'),
  }),
  execute: async ({ splunkCredentials, sid }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      return await splunkRequest(splunkCredentials, `/services/search/jobs/${encodeURIComponent(sid)}`, {
        method: 'DELETE',
      });
    } catch (error) {
      return { error: 'Failed to cancel search job', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const splunkControlSearchJob = tool({
  description: 'Pause, unpause or finalize a running search job to manage long-running search load.',
  inputSchema: z.object({
    splunkCredentials: authField,
    sid: z.string().describe('Search job ID'),
    action: z.enum(['pause', 'unpause', 'finalize']).describe('Control action to execute'),
  }),
  execute: async ({ splunkCredentials, sid, action }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      return await splunkRequest(splunkCredentials, `/services/search/jobs/${encodeURIComponent(sid)}/control`, {
        method: 'POST',
        form: { action },
      });
    } catch (error) {
      return { error: 'Failed to control search job', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
