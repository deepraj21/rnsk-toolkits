// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
    DATA_V1ALPHA,
    DATA_V1BETA,
    gaList,
    gaPost,
    gaRequest,
    googleAnalyticsTokenField,
    namedDimension,
    namedMetric,
    normalizeProperty,
    paginationSchema,
} from './client.js';

const dateRange = z
    .object({
        startDate: z.string().describe("Start date 'YYYY-MM-DD', 'today', 'yesterday', or 'NdaysAgo'"),
        endDate: z.string().describe("End date 'YYYY-MM-DD', 'today', 'yesterday', or 'NdaysAgo'"),
        name: z.string().optional(),
    })
    .catchall(z.unknown());

const reportBody = {
    dateRanges: z.array(dateRange).optional().describe('Date ranges (one required for most reports)'),
    dimensions: z.array(namedDimension).optional().describe("Dimensions, e.g. [{name:'country'}] — confirm apiNames via getMetadata"),
    metrics: z.array(namedMetric).optional().describe("Metrics, e.g. [{name:'activeUsers'}] (max 10) — confirm apiNames via getMetadata"),
    dimensionFilter: z.record(z.any()).optional().describe('Dimension filter expression'),
    metricFilter: z.record(z.any()).optional().describe('Metric filter expression'),
    orderBys: z.array(z.record(z.any())).optional().describe("Ordering, e.g. [{desc:true,metric:{metricName:'activeUsers'}}]"),
    limit: z.number().min(1).max(250000).optional().describe('Rows to return'),
    offset: z.number().min(0).optional().describe('0-based start row for pagination'),
    currencyCode: z.string().optional().describe("ISO 4217 currency, e.g. 'USD'"),
    cohortSpec: z.record(z.any()).optional(),
    comparisons: z.array(z.record(z.any())).optional(),
    keepEmptyRows: z.boolean().optional(),
    returnPropertyQuota: z.boolean().optional().describe('Include quota state in response'),
};

function reportExecute(base: string, suffix: string, action: string, extraBody?: (b: Record<string, unknown>) => void) {
    return async ({ googleAnalyticsToken, property, ...body }: Record<string, any>) => {
        const payload: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(body)) if (v !== undefined) payload[k] = v;
        extraBody?.(payload);
        return gaPost(googleAnalyticsToken, base, `${normalizeProperty(property)}:${suffix}`, payload, undefined, action);
    };
}

const propertyField = z.string().describe("GA4 property 'properties/{id}' (bare numeric ID accepted)");

export const runReport = tool({
    description:
        'Runs a standard GA4 report (dimensions × metrics over date ranges). Confirm dimension/metric apiNames via getMetadata first; check compatibility for risky combos.',
    inputSchema: z.object({ googleAnalyticsToken: googleAnalyticsTokenField, property: propertyField, ...reportBody, metricAggregations: z.array(z.string()).optional() }),
    execute: reportExecute(DATA_V1BETA, 'runReport', 'run report') as any,
});

export const batchRunReports = tool({
    description: 'Runs multiple standard reports for one property in a single call. Each entry is a full runReport-style request.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        property: propertyField,
        requests: z.array(z.record(z.any())).min(1).describe('Report requests (runReport bodies without property)'),
    }),
    execute: reportExecute(DATA_V1BETA, 'batchRunReports', 'batch run reports', (payload) => {
        const { requests } = payload as any;
        delete (payload as any).requests;
        (payload as any).requests = requests;
    }) as any,
});

export const runPivotReport = tool({
    description: 'Runs a pivot-table report (multi-dimensional cross-tab). Define pivots with fieldNames, limit, and metricAggregations.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        property: propertyField,
        metrics: z.array(namedMetric).min(1).describe('At least one metric is required'),
        pivots: z.array(z.record(z.any())).optional().describe("Pivots, e.g. [{fieldNames:['country'],limit:10}]"),
        ...reportBody,
    }),
    execute: reportExecute(DATA_V1BETA, 'runPivotReport', 'run pivot report') as any,
});

export const batchRunPivotReports = tool({
    description: 'Runs multiple pivot reports for one property in a single call.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        property: propertyField,
        requests: z.array(z.record(z.any())).min(1).describe('Pivot report requests (runPivotReport bodies without property)'),
    }),
    execute: reportExecute(DATA_V1BETA, 'batchRunPivotReports', 'batch run pivot reports') as any,
});

export const runRealtimeReport = tool({
    description: 'Runs a realtime report (last 30 minutes of activity). No date ranges; use minuteRanges and metricAggregations instead.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        property: propertyField,
        dimensions: z.array(namedDimension).optional(),
        metrics: z.array(namedMetric).optional(),
        dimensionFilter: z.record(z.any()).optional(),
        metricFilter: z.record(z.any()).optional(),
        orderBys: z.array(z.record(z.any())).optional(),
        limit: z.number().min(1).optional(),
        minuteRanges: z.array(z.record(z.any())).optional().describe("Minute ranges, e.g. [{startMinutesAgo:29,endMinutesAgo:0}]"),
        metricAggregations: z.array(z.string()).optional(),
        returnPropertyQuota: z.boolean().optional(),
    }),
    execute: reportExecute(DATA_V1BETA, 'runRealtimeReport', 'run realtime report') as any,
});

export const runFunnelReport = tool({
    description: 'Runs a funnel analysis report. Funnel needs steps[{name, filterExpression}]; step order in the response comes from step attributes, not row order.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        property: propertyField,
        funnel: z.record(z.any()).describe("Funnel config with 'steps' (each step: name + filterExpression using funnelEventFilter/funnelFieldFilter)"),
        dateRanges: z.array(dateRange).optional(),
        segments: z.array(z.record(z.any())).max(4).optional().describe('Up to 4 segments, each yields its own row'),
        dimensionFilter: z.record(z.any()).optional(),
        funnelBreakdown: z.record(z.any()).optional(),
        funnelNextAction: z.record(z.any()).optional(),
        funnelVisualizationType: z.string().optional(),
        limit: z.number().min(1).max(250000).optional(),
        returnPropertyQuota: z.boolean().optional(),
    }),
    execute: reportExecute(DATA_V1BETA, 'runFunnelReport', 'run funnel report') as any,
});

export const checkCompatibility = tool({
    description: 'Lists dimensions/metrics compatible with a report request. Call before runReport when mixing custom or unusual fields.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        property: propertyField,
        dimensions: z.array(namedDimension).optional(),
        metrics: z.array(namedMetric).max(10).optional().describe('Max 10 metrics'),
        dimensionFilter: z.record(z.any()).optional(),
        metricFilter: z.record(z.any()).optional(),
        compatibilityFilter: z.enum(['DIMENSION_COMPATIBILITY_FILTER_UNSPECIFIED', 'COMPATIBLE', 'INCOMPATIBLE']).optional(),
    }),
    execute: reportExecute(DATA_V1BETA, 'checkCompatibility', 'check compatibility') as any,
});

export const getMetadata = tool({
    description: 'Gets report metadata (available dimensions, metrics, comparisons) for a property. Always derive apiNames from here instead of hardcoding.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        name: z.string().describe("Metadata name 'properties/{id}/metadata' (bare ID accepted)"),
    }),
    execute: async ({ googleAnalyticsToken, name }) => {
        try {
            const full = name.includes('/metadata') ? name : `${normalizeProperty(name)}/metadata`;
            const result = await gaRequest(googleAnalyticsToken, DATA_V1BETA, `/${full}`);
            if (!result.ok) return { error: 'Failed to get metadata', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error getting metadata', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const createReportTask = tool({
    description: 'Creates an async report task for large/complex event-data reports. Poll getReportTask until ACTIVE, then queryReportTask for rows.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        parent: z.string().describe("Property 'properties/{id}' (bare ID accepted)"),
        reportDefinition: z.record(z.any()).optional().describe('Report definition (metrics, dimensions, dateRanges, limit up to 250000)'),
    }),
    execute: async ({ googleAnalyticsToken, parent, reportDefinition }) => {
        const body: Record<string, unknown> = {};
        if (reportDefinition) body.reportDefinition = reportDefinition;
        return gaPost(googleAnalyticsToken, DATA_V1ALPHA, `${normalizeProperty(parent)}/reportTasks`, body, undefined, 'create report task');
    },
});

export const getReportTask = tool({
    description: 'Gets report-task metadata (processing state, definition). Use after createReportTask to check readiness.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        name: z.string().describe("Report task 'properties/{id}/reportTasks/{taskId}'"),
    }),
    execute: async ({ googleAnalyticsToken, name }) => {
        try {
            const result = await gaRequest(googleAnalyticsToken, DATA_V1ALPHA, `/${name}`);
            if (!result.ok) return { error: 'Failed to get report task', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error getting report task', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listReportTasks = tool({
    description: 'Lists report tasks for a property to find and reuse existing tasks.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        parent: z.string().describe("Property 'properties/{id}' (bare ID accepted)"),
        ...paginationSchema,
    }),
    execute: async ({ googleAnalyticsToken, parent, pageSize, pageToken }) =>
        gaList(googleAnalyticsToken, DATA_V1ALPHA, normalizeProperty(parent), 'reportTasks', { pageSize, pageToken }, 'list report tasks'),
});

export const queryReportTask = tool({
    description: 'Retrieves rows from an ACTIVE report task. Errors unless the task state is ACTIVE — check getReportTask first.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        name: z.string().describe("Report task 'properties/{id}/reportTasks/{taskId}'"),
        limit: z.number().min(1).max(250000).optional().describe('Rows to return (default 10000, capped by task limit)'),
        offset: z.number().min(0).optional().describe('0-based row offset; omit or 0 for first page'),
    }),
    execute: async ({ googleAnalyticsToken, name, limit, offset }) => {
        const body: Record<string, unknown> = {};
        if (limit !== undefined) body.limit = limit;
        if (offset !== undefined) body.offset = offset;
        return gaPost(googleAnalyticsToken, DATA_V1ALPHA, `${name}:query`, body, undefined, 'query report task');
    },
});
