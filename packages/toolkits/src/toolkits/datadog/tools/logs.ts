// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { ddApi, toDatadogError } from './client.js';

const credsField = z.string().describe('Datadog credentials JSON with apiKey and appKey (injected by system)');

function toIso(value: string | number | undefined, fallback: string): string {
    if (value === undefined) return fallback;
    if (typeof value === 'number') return new Date(value).toISOString();
    if (/^\d{13}$/.test(value)) return new Date(Number(value)).toISOString();
    return value;
}

export const datadogAggregateLogs = tool({
    description:
        'Aggregate logs server-side without downloading raw events: counts, unique values, percentiles, stats, grouped breakdowns, or timeseries. Use datadogSearchLogs only when individual messages are needed.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        filter: z
            .object({
                query: z.string().optional().describe("Log query, e.g. 'service:api status:error' ('*' for all)"),
                indexes: z.array(z.string()).optional().describe("Indexes to search (omit for all)"),
                from_time: z.string().optional().describe("Range start: date math, ms epoch, or ISO (default 'now-15m')"),
                to_time: z.string().optional().describe("Range end: date math, ms epoch, or ISO (default 'now')"),
                storage_tier: z.enum(['indexes', 'online-archives', 'flex']).optional().describe('Storage tier'),
            })
            .optional()
            .describe('Query, time range, indexes, and tier'),
        compute: z
            .array(z.record(z.any()))
            .optional()
            .describe("Calculations, e.g. [{aggregation:'count'}] (only count works without metric)"),
        group_by: z
            .array(z.record(z.any()))
            .optional()
            .describe("Facets to bucket by, e.g. [{facet:'service',limit:10}]"),
        page: z.object({ cursor: z.string() }).optional().describe('Continue with the previous next_cursor'),
    }),
    execute: async ({ datadogCredentials, filter, compute, group_by, page }) => {
        try {
            return await ddApi(datadogCredentials, 'POST', '/api/v2/logs/analytics/aggregate', {
                body: {
                    filter: {
                        query: filter?.query ?? '*',
                        indexes: filter?.indexes,
                        from: toIso(filter?.from_time, 'now-15m'),
                        to: toIso(filter?.to_time, 'now'),
                        storage_tier: filter?.storage_tier,
                    },
                    compute: compute ?? [{ aggregation: 'count' }],
                    group_by,
                    page,
                },
            });
        } catch (error) {
            return toDatadogError(error, 'Failed to aggregate logs');
        }
    },
});

export const datadogSearchLogs = tool({
    description:
        'Search individual log messages with a query and millisecond time range. List indexes with datadogListLogIndexes first — a wrong or missing index silently hides logs. Paginate with the returned nextLogId.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        query: z.string().describe("Log query, e.g. 'status:error' or '*'"),
        time_from: z.number().describe('Range start as ms epoch (13-digit, max 15-day window)'),
        time_to: z.number().describe('Range end as ms epoch (13-digit)'),
        index: z.string().optional().describe('Index to search (discover via datadogListLogIndexes)'),
        limit: z.number().min(1).max(1000).optional().default(50).describe('Max logs per page'),
        start_at: z.string().optional().describe('Pagination cursor (nextLogId); same query/time required'),
    }),
    execute: async ({ datadogCredentials, query, time_from, time_to, index, limit = 50, start_at }) => {
        try {
            const data = await ddApi(datadogCredentials, 'POST', '/api/v2/logs/events/search', {
                body: {
                    filter: {
                        from: new Date(time_from).toISOString(),
                        to: new Date(time_to).toISOString(),
                        query,
                        indexes: index ? [index] : undefined,
                    },
                    page: { limit, cursor: start_at },
                },
            });
            const entries = Array.isArray(data?.data) ? data.data : [];
            return {
                logs: entries.map((e: any) => ({
                    id: e.id,
                    timestamp: e.attributes?.timestamp,
                    host: e.attributes?.host,
                    service: e.attributes?.service,
                    message: e.attributes?.message,
                    tags: e.attributes?.tags,
                    attributes: e.attributes,
                })),
                total: entries.length,
                status: data?.meta?.status,
                nextLogId: data?.meta?.page?.after,
            };
        } catch (error) {
            return toDatadogError(error, 'Failed to search logs');
        }
    },
});

export const datadogListLogIndexes = tool({
    description:
        'List log index names and configs. Call before datadogSearchLogs to pick the right index and avoid hidden results or excess usage.',
    inputSchema: z.object({
        datadogCredentials: credsField,
    }),
    execute: async ({ datadogCredentials }) => {
        try {
            const data = await ddApi(datadogCredentials, 'GET', '/api/v1/logs/config/indexes');
            return Array.isArray(data) ? { indexes: data } : data;
        } catch (error) {
            return toDatadogError(error, 'Failed to list log indexes');
        }
    },
});
