// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { ddApi, toDatadogError } from './client.js';

const credsField = z.string().describe('Datadog credentials JSON with apiKey and appKey (injected by system)');

export const datadogListMetrics = tool({
    description:
        'Discover actively reporting metric names since a timestamp, optionally filtered by host or tags. Use before datadogQueryMetrics to find exact names.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        from_timestamp: z.number().describe('Seconds since epoch: list metrics active since this time'),
        host: z.string().optional().describe('Only metrics reported with this hostname tag'),
        tag_filter: z.string().optional().describe("Tag filter, e.g. 'env:prod AND service:api' (no other filters)"),
    }),
    execute: async ({ datadogCredentials, from_timestamp, host, tag_filter }) => {
        try {
            return await ddApi(datadogCredentials, 'GET', '/api/v1/metrics', {
                query: { from: from_timestamp, host, tag_filter },
            });
        } catch (error) {
            return toDatadogError(error, 'Failed to list metrics');
        }
    },
});

export const datadogQueryMetrics = tool({
    description:
        'Query timeseries data with a metrics query string over a UTC seconds range (max 1 year). Use datadogListMetrics first to confirm names; millisecond timestamps silently return empty series.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        query: z.string().describe("Query, e.g. 'avg:system.cpu.user{*}'"),
        from_timestamp: z.number().describe('Range start as UTC seconds'),
        to_timestamp: z.number().describe('Range end as UTC seconds'),
    }),
    execute: async ({ datadogCredentials, query, from_timestamp, to_timestamp }) => {
        try {
            return await ddApi(datadogCredentials, 'GET', '/api/v1/query', {
                query: { from: from_timestamp, to: to_timestamp, query },
            });
        } catch (error) {
            return toDatadogError(error, 'Failed to query metrics');
        }
    },
});

export const datadogSubmitMetrics = tool({
    description:
        'Submit custom gauge/rate/count series (KPIs, app metrics). Points default to the current time when timestamp is omitted.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        series: z
            .array(
                z.object({
                    metric: z.string().describe('Metric name, e.g. myapp.response_time'),
                    points: z
                        .array(
                            z.object({
                                timestamp: z.number().optional().describe('Seconds epoch (defaults to now)'),
                                value: z.number().describe('Point value'),
                            }),
                        )
                        .min(1)
                        .describe('Data points'),
                    host: z.string().optional().describe('Host name'),
                    tags: z.array(z.string()).optional().describe("Tags, e.g. ['env:production']"),
                    type: z.string().optional().describe("One of 'gauge', 'rate', 'count'"),
                    interval: z.number().optional().describe('Seconds between points (rate metrics)'),
                }),
            )
            .min(1)
            .describe('Series to submit'),
    }),
    execute: async ({ datadogCredentials, series }) => {
        try {
            const now = Math.floor(Date.now() / 1000);
            return await ddApi(datadogCredentials, 'POST', '/api/v1/series', {
                body: {
                    series: series.map((s) => ({
                        ...s,
                        points: s.points.map((p) => [p.timestamp ?? now, p.value]),
                    })),
                },
            });
        } catch (error) {
            return toDatadogError(error, 'Failed to submit metrics');
        }
    },
});
