// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dynatraceRequest, failedResult, toDynatraceError } from './client.js';

const credsField = z
    .string()
    .describe(
        'Dynatrace credentials JSON with baseUrl and apiToken, e.g. {"baseUrl":"https://abc123.live.dynatrace.com","apiToken":"..."} (Managed: "https://dynatrace.example.com/e/ENV_ID").',
    );
const sloBody = z
    .record(z.any())
    .describe(
        'SLO object, e.g. {"name":"Checkout availability","description":"...","metricExpression":"(100)*(builtin:service.errors.total.count:splitBy():sum)/(builtin:service.requestCount.total:splitBy():sum)","evaluationWindow":"-7d","target":95,"warning":97.5,"evaluationType":"AGGREGATE"}',
    );

export const listSLOs = tool({
    description:
        'List service-level objectives with targets, error budgets and evaluation windows. Filter with an sloSelector. Requires slo.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        sloSelector: z
            .string()
            .optional()
            .describe('SLO selector, e.g. \'name("Checkout")\', \'evaluatedPercentage(90,100)\''),
        sort: z.string().optional().describe('Sort, e.g. "name" (prefix - for descending)'),
        timeFrame: z.string().optional().describe('Evaluation timeframe, e.g. "WEEK", "MONTH"'),
        pageSize: z.number().int().min(1).max(500).optional().describe('Results per page (default 100)'),
        from: z.string().optional().describe('Start: relative ("now-7d") or ISO timestamp'),
        to: z.string().optional().describe('End: relative or ISO timestamp (default now)'),
        evaluate: z.boolean().optional().describe('Calculate error budgets in the response (default false)'),
    }),
    execute: async ({ dynatraceCredentials, sloSelector, sort, timeFrame, pageSize, from, to, evaluate }) => {
        try {
            const result = await dynatraceRequest(dynatraceCredentials, '/api/v2/slo', {
                query: { sloSelector, sort, timeFrame, pageSize, from, to, evaluate },
            });
            if (!result.ok) return failedResult('Failed to list Dynatrace SLOs', result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, 'Error listing Dynatrace SLOs');
        }
    },
});

export const getSLO = tool({
    description: 'Get a single SLO with objectives, error budget and related entities. Requires slo.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        sloId: z.string().describe('SLO ID (UUID)'),
        timeFrame: z.string().optional().describe('Evaluation timeframe, e.g. "WEEK", "MONTH"'),
        from: z.string().optional().describe('Start: relative or ISO timestamp'),
        to: z.string().optional().describe('End: relative or ISO timestamp (default now)'),
    }),
    execute: async ({ dynatraceCredentials, sloId, timeFrame, from, to }) => {
        try {
            const result = await dynatraceRequest(
                dynatraceCredentials,
                `/api/v2/slo/${encodeURIComponent(sloId)}`,
                { query: { timeFrame, from, to } },
            );
            if (!result.ok) return failedResult(`Failed to get Dynatrace SLO "${sloId}"`, result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, `Error getting Dynatrace SLO "${sloId}"`);
        }
    },
});

export const createSLO = tool({
    description: 'Create a service-level objective. Requires slo.write scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        slo: sloBody,
    }),
    execute: async ({ dynatraceCredentials, slo }) => {
        try {
            const result = await dynatraceRequest(dynatraceCredentials, '/api/v2/slo', {
                method: 'POST',
                body: slo,
            });
            if (!result.ok) return failedResult('Failed to create Dynatrace SLO', result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, 'Error creating Dynatrace SLO');
        }
    },
});

export const updateSLO = tool({
    description: 'Update a service-level objective. Pass the full SLO object. Requires slo.write scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        sloId: z.string().describe('SLO ID (UUID) to update'),
        slo: sloBody,
    }),
    execute: async ({ dynatraceCredentials, sloId, slo }) => {
        try {
            const result = await dynatraceRequest(
                dynatraceCredentials,
                `/api/v2/slo/${encodeURIComponent(sloId)}`,
                { method: 'PUT', body: slo },
            );
            if (!result.ok) return failedResult(`Failed to update Dynatrace SLO "${sloId}"`, result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, `Error updating Dynatrace SLO "${sloId}"`);
        }
    },
});

export const deleteSLO = tool({
    description: 'Delete a service-level objective. Requires slo.write scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        sloId: z.string().describe('SLO ID (UUID) to delete'),
    }),
    execute: async ({ dynatraceCredentials, sloId }) => {
        try {
            const result = await dynatraceRequest(
                dynatraceCredentials,
                `/api/v2/slo/${encodeURIComponent(sloId)}`,
                { method: 'DELETE' },
            );
            if (!result.ok) return failedResult(`Failed to delete Dynatrace SLO "${sloId}"`, result);
            return { success: true, sloId, statusCode: result.status };
        } catch (error) {
            return toDynatraceError(error, `Error deleting Dynatrace SLO "${sloId}"`);
        }
    },
});
