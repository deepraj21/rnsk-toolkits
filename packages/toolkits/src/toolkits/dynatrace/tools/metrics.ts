// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dynatraceRequest, failedResult, toDynatraceError } from './client.js';

const credsField = z
    .string()
    .describe(
        'Dynatrace credentials JSON with baseUrl and apiToken, e.g. {"baseUrl":"https://abc123.live.dynatrace.com","apiToken":"..."} (Managed: "https://dynatrace.example.com/e/ENV_ID").',
    );

export const listMetrics = tool({
    description:
        'List metric definitions available in the environment. Filter with a metricSelector (e.g. "builtin:service.response.time") or free text. Use to discover metric keys before querying.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        metricSelector: z
            .string()
            .optional()
            .describe('Metric selector filter, e.g. "builtin:service.response.time"'),
        text: z.string().optional().describe('Free-text search across metric keys and names'),
        entitySelector: z.string().optional().describe('Only metrics related to these entities'),
        fields: z.string().optional().describe('Extra fields, e.g. "+unit,+dimensions"'),
        pageSize: z.number().int().min(1).max(500).optional().describe('Results per page (default 100)'),
    }),
    execute: async ({ dynatraceCredentials, metricSelector, text, entitySelector, fields, pageSize }) => {
        try {
            const result = await dynatraceRequest(dynatraceCredentials, '/api/v2/metrics', {
                query: { metricSelector, text, entitySelector, fields, pageSize },
            });
            if (!result.ok) return failedResult('Failed to list Dynatrace metrics', result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, 'Error listing Dynatrace metrics');
        }
    },
});

export const getMetric = tool({
    description: 'Get one metric definition with unit, dimensions, transformations and aggregation types. Requires metrics.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        metricId: z.string().describe('Metric key, e.g. "builtin:service.response.time"'),
    }),
    execute: async ({ dynatraceCredentials, metricId }) => {
        try {
            const result = await dynatraceRequest(
                dynatraceCredentials,
                `/api/v2/metrics/${encodeURIComponent(metricId)}`,
            );
            if (!result.ok)
                return failedResult(`Failed to get Dynatrace metric "${metricId}"`, result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, `Error getting Dynatrace metric "${metricId}"`);
        }
    },
});

export const queryMetrics = tool({
    description:
        'Query metric datapoints with a metric selector, e.g. "builtin:service.response.time:filter(and(in(\\"dt.entity.service\\",entitySelector(\\"type(SERVICE)\\")))):splitBy(\\"dt.entity.service\\"):avg:auto:sort(value(avg,descending)):limit(20)". Supports transformations, filtering and splitting. Requires metrics.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        metricSelector: z.string().describe('Full metric selector expression (required)'),
        resolution: z
            .string()
            .optional()
            .describe('Sampling: "Inf", seconds like "60", or ISO-8601 duration like "PT5M" (default auto)'),
        from: z.string().optional().describe('Start: relative ("now-2h") or ISO timestamp'),
        to: z.string().optional().describe('End: relative or ISO timestamp (default now)'),
        entitySelector: z.string().optional().describe('Entity scope, e.g. \'type("HOST")\''),
        mzSelector: z.string().optional().describe('Management-zone scope, e.g. \'mzName("Production")\''),
    }),
    execute: async ({ dynatraceCredentials, metricSelector, resolution, from, to, entitySelector, mzSelector }) => {
        try {
            const result = await dynatraceRequest(dynatraceCredentials, '/api/v2/metrics/query', {
                query: { metricSelector, resolution, from, to, entitySelector, mzSelector },
            });
            if (!result.ok) return failedResult('Failed to query Dynatrace metrics', result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, 'Error querying Dynatrace metrics');
        }
    },
});

export const ingestMetrics = tool({
    description:
        'Ingest custom metric datapoints in metric-ingest line protocol. Requires metrics.ingest scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        lines: z
            .array(z.string())
            .describe(
                'Metric lines, e.g. ["my.custom.metric,environment=\\"prod\\" 42 1710000000000"]. Format: metric[,dimensions] value [timestamp-ms].',
            ),
    }),
    execute: async ({ dynatraceCredentials, lines }) => {
        try {
            const result = await dynatraceRequest(dynatraceCredentials, '/api/v2/metrics/ingest', {
                method: 'POST',
                body: lines.join('\n'),
                contentType: 'text/plain; charset=utf-8',
            });
            if (!result.ok) return failedResult('Failed to ingest Dynatrace metrics', result);
            return { success: true, ingestedLines: lines.length, statusCode: result.status };
        } catch (error) {
            return toDynatraceError(error, 'Error ingesting Dynatrace metrics');
        }
    },
});

export const deleteMetric = tool({
    description: 'Delete a custom metric definition and its data. Built-in metrics cannot be deleted. Requires metrics.write scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        metricId: z.string().describe('Custom metric key to delete, e.g. "my.custom.metric"'),
    }),
    execute: async ({ dynatraceCredentials, metricId }) => {
        try {
            const result = await dynatraceRequest(
                dynatraceCredentials,
                `/api/v2/metrics/${encodeURIComponent(metricId)}`,
                { method: 'DELETE' },
            );
            if (!result.ok)
                return failedResult(`Failed to delete Dynatrace metric "${metricId}"`, result);
            return { success: true, metricId, statusCode: result.status };
        } catch (error) {
            return toDynatraceError(error, `Error deleting Dynatrace metric "${metricId}"`);
        }
    },
});
