// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { ddApi, toDatadogError } from './client.js';

const credsField = z.string().describe('Datadog credentials JSON with apiKey and appKey (injected by system)');

export const datadogListApmServices = tool({
    description:
        'List APM services for an environment with performance stats. Use env "*" for all environments. Requires APM instrumentation.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        env: z.string().optional().default('*').describe("Environment, e.g. 'production' ('*' for all)"),
    }),
    execute: async ({ datadogCredentials, env = '*' }) => {
        try {
            const data = await ddApi(datadogCredentials, 'GET', '/api/v2/apm/services', {
                query: { 'filter[env]': env },
            });
            const services = (data as any)?.data ?? [];
            return { services, total_count: services.length };
        } catch (error) {
            return toDatadogError(error, 'Failed to list APM services');
        }
    },
});

export const datadogSearchTraces = tool({
    description:
        'Search distributed traces for incident investigation and bottleneck analysis. Bound the window, include env and service, and prefix custom attributes with @. Paginate with page.cursor.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        filter: z
            .object({
                query: z.string().optional().describe("Trace query, e.g. 'service:api @http.status_code:>=400'"),
                from_time: z.string().describe("Range start: ISO, 'now-1h', etc."),
                to_time: z.string().describe("Range end: ISO or 'now'"),
            })
            .describe('Time-bounded filter (from_time and to_time required)'),
        sort: z
            .object({
                field: z.string().optional().describe("Sort field: 'timestamp' (default), '@duration', '@http.status_code'"),
                order: z.string().optional().describe("'asc' or 'desc' (default)"),
            })
            .optional()
            .describe('Sort configuration'),
        page: z.record(z.any()).optional().describe('Pagination, e.g. {limit: 25, cursor: "..."}'),
        options: z.record(z.any()).optional().describe('Extra options, e.g. {timezone: "UTC"}'),
    }),
    execute: async ({ datadogCredentials, filter, sort, page, options }) => {
        try {
            const data = await ddApi(datadogCredentials, 'POST', '/api/v2/spans/events/search', {
                body: {
                    data: {
                        type: 'search_request',
                        attributes: { filter, sort, page, options },
                    },
                },
            });
            return {
                data: (data as any)?.data ?? [],
                meta: (data as any)?.meta,
                links: (data as any)?.links,
                total_count: (data as any)?.meta?.page?.total_count,
            };
        } catch (error) {
            return toDatadogError(error, 'Failed to search traces');
        }
    },
});

export const datadogSearchSpansAnalytics = tool({
    description:
        'Aggregate span data (error rates, latency patterns) grouped by facets. The body must be a valid aggregate_request — when filter/compute cannot satisfy the schema, use datadogSearchTraces instead.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        filter: z
            .object({
                query: z.string().optional().describe("Span query, e.g. 'env:production error.type:*'"),
                from_time: z.string().optional().describe("Range start: ISO or relative"),
                to_time: z.string().optional().describe("Range end: ISO or relative"),
                indexes: z.array(z.string()).optional().describe('Indexes to search'),
            })
            .describe('Span filter'),
        compute: z
            .array(z.record(z.any()))
            .optional()
            .describe("Aggregations with metric+type; percentile needs the percentile field (0.5/0.75/0.9/0.95/0.98/0.99)"),
        group_by: z
            .array(z.record(z.any()))
            .optional()
            .describe("Group-bys with facet, e.g. [{facet:'service',limit:10}]"),
        options: z.record(z.any()).optional().describe('Extra options, e.g. {timezone: "UTC"}'),
    }),
    execute: async ({ datadogCredentials, filter, compute, group_by, options }) => {
        try {
            return await ddApi(datadogCredentials, 'POST', '/api/v2/spans/analytics/aggregate', {
                body: {
                    data: {
                        type: 'aggregate_request',
                        attributes: { filter, compute, group_by, options },
                    },
                },
            });
        } catch (error) {
            return toDatadogError(error, 'Failed to search spans analytics');
        }
    },
});
