// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { grafanaRequest } from './utils.js';

export const getDistributorHaTracker = tool({
    description:
        'Retrieve distributor HA tracker status showing which replica is elected leader for each Prometheus HA cluster.',
    inputSchema: z.object({
        grafanaCredentials: z.string().describe('Grafana credentials JSON with baseUrl and optional apiToken'),
    }),
    execute: async ({ grafanaCredentials }) => {
        try {
            const result = await grafanaRequest(grafanaCredentials, '/distributor/ha_tracker');

            if (!result.ok) {
                return {
                    error: 'Failed to get distributor HA tracker status',
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
                error: 'Error getting distributor HA tracker status',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
