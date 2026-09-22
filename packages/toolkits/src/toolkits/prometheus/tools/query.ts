// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { promRequest, toPromError } from './client.js';

const credsField = z.string().describe('Prometheus credentials JSON with baseUrl and optional username/password or bearerToken');
const timeField = z.string().optional().describe('RFC3339 or unix timestamp in seconds (decimals allowed)');
const timeoutField = z.string().optional().describe('Evaluation timeout, e.g. 30s (capped by server -query.timeout)');

export const instantQuery = tool({
    description: 'Evaluates a PromQL expression at a single instant. Returns vector/scalar/string result.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
        query: z.string().describe("PromQL expression, e.g. 'up' or 'sum(rate(http_requests_total[5m]))'"),
        time: timeField.describe('Evaluation timestamp (default: server time)'),
        timeout: timeoutField,
        limit: z.number().int().optional().describe('Max returned series (0 = disabled)'),
        stats: z.string().optional().describe("Query stats: 'true' or 'all'"),
    }),
    execute: async ({ prometheusCredentials, query, time, timeout, limit, stats }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/query', {
                query: { query, time, timeout, limit, stats },
            });
        } catch (error) {
            return toPromError(error, 'Failed to run instant query');
        }
    },
});

export const rangeQuery = tool({
    description: 'Evaluates a PromQL expression over a time range. Returns a matrix (values per step).',
    inputSchema: z.object({
        prometheusCredentials: credsField,
        query: z.string().describe("PromQL expression, e.g. 'up'"),
        start: z.string().describe('Range start, RFC3339 or unix timestamp (inclusive)'),
        end: z.string().describe('Range end, RFC3339 or unix timestamp (inclusive)'),
        step: z.string().describe('Resolution, e.g. 15s, 1m, or float seconds'),
        timeout: timeoutField,
        limit: z.number().int().optional().describe('Max returned series (0 = disabled)'),
        stats: z.string().optional().describe("Query stats: 'true' or 'all'"),
    }),
    execute: async ({ prometheusCredentials, query, start, end, step, timeout, limit, stats }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/query_range', {
                query: { query, start, end, step, timeout, limit, stats },
            });
        } catch (error) {
            return toPromError(error, 'Failed to run range query');
        }
    },
});

export const formatQuery = tool({
    description: 'Prettifies a PromQL expression (comments are removed). Use to normalize queries before storing or comparing.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
        query: z.string().describe("PromQL expression, e.g. 'foo/bar'"),
    }),
    execute: async ({ prometheusCredentials, query }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/format_query', { query: { query } });
        } catch (error) {
            return toPromError(error, 'Failed to format query');
        }
    },
});

export const parseQuery = tool({
    description: 'Parses a PromQL expression into a JSON AST. Experimental endpoint (primarily for the web UI); format may change.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
        query: z.string().describe('PromQL expression to parse'),
    }),
    execute: async ({ prometheusCredentials, query }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/parse_query', { query: { query } });
        } catch (error) {
            return toPromError(error, 'Failed to parse query');
        }
    },
});

export const queryExemplars = tool({
    description: 'Returns exemplars (e.g. trace IDs) for a PromQL query over a time range. Experimental; may change.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
        query: z.string().describe('PromQL expression, e.g. test_exemplar_metric_total'),
        start: z.string().describe('Range start, RFC3339 or unix timestamp'),
        end: z.string().describe('Range end, RFC3339 or unix timestamp'),
    }),
    execute: async ({ prometheusCredentials, query, start, end }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/query_exemplars', {
                query: { query, start, end },
            });
        } catch (error) {
            return toPromError(error, 'Failed to query exemplars');
        }
    },
});
