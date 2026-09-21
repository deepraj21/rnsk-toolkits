// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { ddApi, toDatadogError } from './client.js';

const credsField = z.string().describe('Datadog credentials JSON with apiKey and appKey (injected by system)');

export const datadogGetUsageSummary = tool({
    description:
        'Get monthly billable usage (hosts, containers, API calls, logs) for cost monitoring. Empty payloads for inactive months are expected, not errors.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        start_month: z.string().describe("Start month 'YYYY-MM', e.g. '2024-01'"),
        end_month: z.string().optional().describe("End month 'YYYY-MM' (defaults to start_month)"),
        include_org_details: z.boolean().optional().describe('Include organization details'),
    }),
    execute: async ({ datadogCredentials, start_month, end_month, include_org_details }) => {
        try {
            return await ddApi(datadogCredentials, 'GET', '/api/v1/usage/summary', {
                query: { start_month, end_month, include_org_details },
            });
        } catch (error) {
            return toDatadogError(error, 'Failed to get usage summary');
        }
    },
});
