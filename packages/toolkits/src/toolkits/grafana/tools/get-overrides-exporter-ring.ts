// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { grafanaRequest } from './utils.js';

export const getOverridesExporterRing = tool({
    description:
        'Retrieve overrides-exporter hash ring status including state, health, and last heartbeat of each node.',
    inputSchema: z.object({
        grafanaCredentials: z.string().describe('Grafana credentials JSON with baseUrl and optional apiToken'),
    }),
    execute: async ({ grafanaCredentials }) => {
        try {
            const result = await grafanaRequest(grafanaCredentials, '/overrides-exporter/ring');

            if (!result.ok) {
                return {
                    error: 'Failed to get overrides-exporter ring status',
                    details: result.data,
                    statusCode: result.status,
                };
            }

            return {
                statusCode: result.status,
                htmlContent: result.data,
            };
        } catch (error) {
            return {
                error: 'Error getting overrides-exporter ring status',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
