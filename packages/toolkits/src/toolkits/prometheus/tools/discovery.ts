// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { promRequest, toPromError } from './client.js';

const credsField = z.string().describe('Prometheus credentials JSON with baseUrl and optional username/password or bearerToken');
const matchField = z.array(z.string()).optional().describe("Series selectors, e.g. ['up', 'process_start_time_seconds{job=\"prometheus\"}']");
const startField = z.string().optional().describe('Start timestamp, RFC3339 or unix seconds');
const endField = z.string().optional().describe('End timestamp, RFC3339 or unix seconds');
const limitField = z.number().int().optional().describe('Max results (0 = disabled)');

export const findSeries = tool({
    description: 'Lists time series matching label selectors. Requires at least one match[] selector.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
        match: z.array(z.string()).min(1).describe('Series selectors (at least one required)'),
        start: startField,
        end: endField,
        limit: limitField,
    }),
    execute: async ({ prometheusCredentials, match, start, end, limit }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/series', {
                query: { 'match[]': match, start, end, limit },
            });
        } catch (error) {
            return toPromError(error, 'Failed to find series');
        }
    },
});

export const labelNames = tool({
    description: 'Lists label names, optionally scoped to series selectors and a time window.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
        match: matchField,
        start: startField,
        end: endField,
        limit: limitField,
    }),
    execute: async ({ prometheusCredentials, match, start, end, limit }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/labels', {
                query: { 'match[]': match, start, end, limit },
            });
        } catch (error) {
            return toPromError(error, 'Failed to list label names');
        }
    },
});

export const labelValues = tool({
    description: 'Lists values for a label name, optionally scoped to series selectors and a time window.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
        label: z.string().describe("Label name, e.g. 'job'. Names with '/' need U__ escaping (see docs)."),
        match: matchField,
        start: startField,
        end: endField,
        limit: limitField,
    }),
    execute: async ({ prometheusCredentials, label, match, start, end, limit }) => {
        try {
            return await promRequest(prometheusCredentials, `/api/v1/label/${encodeURIComponent(label)}/values`, {
                query: { 'match[]': match, start, end, limit },
            });
        } catch (error) {
            return toPromError(error, 'Failed to list label values');
        }
    },
});

const searchBase = {
    match: matchField.describe('Series selectors scoping the search'),
    search: z.array(z.string()).optional().describe('Search strings (OR semantics)'),
    start: startField,
    end: endField,
    limit: z.number().int().optional().describe('Max results (default 100)'),
    batchSize: z.number().int().optional().describe('Preferred NDJSON batch size (default 100)'),
    fuzzThreshold: z.number().optional().describe('Fuzzy threshold 0-100'),
    fuzzAlg: z.enum(['subsequence', 'jarowinkler']).optional().describe('Matching algorithm (default subsequence)'),
    caseSensitive: z.boolean().optional().describe('Case-sensitive matching'),
    sortBy: z.string().optional().describe("Sort mode, e.g. 'alpha' or 'score'"),
    sortDir: z.enum(['asc', 'dsc']).optional().describe('Sort direction (only with sort_by=alpha)'),
    includeScore: z.boolean().optional().describe('Include relevance score'),
};

export const searchMetricNames = tool({
    description: 'Streams metric-name autocomplete results (NDJSON). Experimental; requires --enable-feature=search-api.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
        ...searchBase,
        includeMetadata: z.boolean().optional().describe('Include metric type/help metadata'),
    }),
    execute: async (input) => {
        try {
            const { prometheusCredentials, match, search, ...rest } = input;
            return await promRequest(prometheusCredentials, '/api/v1/search/metric_names', {
                query: { 'match[]': match, 'search[]': search, ...rest },
                acceptNdjson: true,
            });
        } catch (error) {
            return toPromError(error, 'Failed to search metric names');
        }
    },
});

export const searchLabelNames = tool({
    description: 'Streams label-name autocomplete results (NDJSON). Experimental; requires --enable-feature=search-api.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
        ...searchBase,
    }),
    execute: async (input) => {
        try {
            const { prometheusCredentials, match, search, ...rest } = input;
            return await promRequest(prometheusCredentials, '/api/v1/search/label_names', {
                query: { 'match[]': match, 'search[]': search, ...rest },
                acceptNdjson: true,
            });
        } catch (error) {
            return toPromError(error, 'Failed to search label names');
        }
    },
});

export const searchLabelValues = tool({
    description: 'Streams label-value autocomplete results (NDJSON) for a label. Experimental; requires --enable-feature=search-api.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
        label: z.string().describe('Label name whose values to search (required)'),
        ...searchBase,
    }),
    execute: async (input) => {
        try {
            const { prometheusCredentials, label, match, search, ...rest } = input;
            return await promRequest(prometheusCredentials, '/api/v1/search/label_values', {
                query: { label, 'match[]': match, 'search[]': search, ...rest },
                acceptNdjson: true,
            });
        } catch (error) {
            return toPromError(error, 'Failed to search label values');
        }
    },
});

export const targetMetadata = tool({
    description: 'Returns metric metadata scraped from targets (type/help/unit). Experimental; remote-write/OTLP metadata excluded.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
        matchTarget: z.string().optional().describe('Target label selectors, e.g. {job="prometheus"} (empty = all)'),
        metric: z.string().optional().describe('Metric name filter (empty = all)'),
        limit: z.number().int().optional().describe('Max targets to match'),
    }),
    execute: async ({ prometheusCredentials, matchTarget, metric, limit }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/targets/metadata', {
                query: { match_target: matchTarget, metric, limit },
            });
        } catch (error) {
            return toPromError(error, 'Failed to get target metadata');
        }
    },
});

export const metricMetadata = tool({
    description: 'Returns metric metadata (type/help/unit per metric name) without target info. Experimental.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
        metric: z.string().optional().describe('Metric name filter (empty = all)'),
        limit: z.number().int().optional().describe('Max metrics to return'),
        limitPerMetric: z.number().int().optional().describe('Max metadata entries per metric'),
    }),
    execute: async ({ prometheusCredentials, metric, limit, limitPerMetric }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/metadata', {
                query: { metric, limit, limit_per_metric: limitPerMetric },
            });
        } catch (error) {
            return toPromError(error, 'Failed to get metric metadata');
        }
    },
});
