// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { ddApi, toDatadogError } from './client.js';

const credsField = z.string().describe('Datadog credentials JSON with apiKey and appKey (injected by system)');

const thresholdSchema = z.object({
    target: z.number().min(0).max(100).describe('Target percentage, e.g. 99.9'),
    timeframe: z.enum(['7d', '30d', '90d']).describe('Target timeframe'),
    warning: z.number().min(0).max(100).optional().describe('Warning threshold percentage'),
});

export const datadogCreateSlo = tool({
    description:
        'Create a metric or monitor SLO with target thresholds. Metric SLOs need numerator/denominator queries; monitor SLOs need monitor IDs.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        name: z.string().min(1).max(100).describe('SLO display name'),
        type: z.enum(['metric', 'monitor']).describe('SLO type'),
        thresholds: z.array(thresholdSchema).min(1).describe('Target thresholds'),
        query: z
            .object({
                numerator: z.string().describe('Good-events metric query'),
                denominator: z.string().describe('Total-events metric query'),
            })
            .optional()
            .describe('Required for metric SLOs'),
        monitor_ids: z.array(z.number()).optional().describe('Required for monitor SLOs'),
        description: z.string().max(500).optional().describe('SLO description'),
        tags: z.array(z.string()).optional().describe("Tags, e.g. ['key:value']"),
        groups: z.array(z.string()).optional().describe('SLO scope groups'),
    }),
    execute: async ({ datadogCredentials, ...body }) => {
        try {
            const data = await ddApi(datadogCredentials, 'POST', '/api/v1/slo', { body });
            return { ...(data as object), success: true };
        } catch (error) {
            return toDatadogError(error, 'Failed to create SLO');
        }
    },
});

export const datadogListSlos = tool({
    description:
        'List SLOs with tag, name/description, and limit/offset filters.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        tags: z.string().optional().describe("Comma-separated tag filter, e.g. 'env:prod,team:backend'"),
        query: z.string().optional().describe('Name/description search'),
        limit: z.number().min(1).max(1000).optional().default(25).describe('Max SLOs (1-1000)'),
        offset: z.number().min(0).optional().default(0).describe('SLOs to skip'),
    }),
    execute: async ({ datadogCredentials, tags, query, limit = 25, offset = 0 }) => {
        try {
            const data = await ddApi(datadogCredentials, 'GET', '/api/v1/slo', {
                query: { tags_query: tags, query, limit, offset },
            });
            const slos = (data as any)?.data ?? [];
            return { slos, total_count: (data as any)?.meta?.page?.total_count ?? slos.length };
        } catch (error) {
            return toDatadogError(error, 'Failed to list SLOs');
        }
    },
});
