// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { grafanaRequest } from './utils.js';

export const queryPublicDashboard = tool({
    description:
        'Query a panel on a public Grafana dashboard to retrieve time-series data and metrics for a specified time range.',
    inputSchema: z.object({
        grafanaCredentials: z.string().describe('Grafana credentials JSON with baseUrl'),
        accessToken: z.string().describe('Public dashboard access token'),
        panelId: z.number().int().min(1).describe('Panel ID to query within the dashboard'),
        from: z
            .string()
            .describe("Start time for the query, e.g. 'now-6h' or an epoch millisecond timestamp"),
        to: z
            .string()
            .describe("End time for the query, e.g. 'now' or an epoch millisecond timestamp"),
        intervalMs: z
            .number()
            .int()
            .min(1)
            .optional()
            .describe('Time interval between data points in milliseconds'),
        maxDataPoints: z
            .number()
            .int()
            .min(1)
            .optional()
            .describe('Maximum number of data points to return'),
        baseUrlOverride: z
            .string()
            .optional()
            .describe('Optional base URL override for the Grafana instance hosting the public dashboard'),
    }),
    execute: async ({
        grafanaCredentials,
        accessToken,
        panelId,
        from,
        to,
        intervalMs,
        maxDataPoints,
        baseUrlOverride,
    }) => {
        try {
            const body: Record<string, unknown> = {
                timeRange: { from, to },
            };
            if (intervalMs !== undefined) body.intervalMs = intervalMs;
            if (maxDataPoints !== undefined) body.maxDataPoints = maxDataPoints;

            const result = await grafanaRequest(
                grafanaCredentials,
                `/api/public/dashboards/${accessToken}/panels/${panelId}/query`,
                {
                    method: 'POST',
                    body,
                    contentType: 'application/json',
                    acceptJson: true,
                    baseUrlOverride,
                },
            );

            if (!result.ok) {
                return {
                    error: 'Failed to query public dashboard panel',
                    details: result.data,
                    statusCode: result.status,
                };
            }

            return {
                statusCode: result.status,
                results: result.data?.results ?? result.data,
            };
        } catch (error) {
            return {
                error: 'Error querying public dashboard panel',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
