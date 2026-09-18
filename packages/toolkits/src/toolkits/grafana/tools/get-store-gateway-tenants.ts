// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { grafanaRequest } from './utils.js';

export const getStoreGatewayTenants = tool({
    description:
        'Retrieve store gateway tenants that have blocks stored in the configured storage.',
    inputSchema: z.object({
        grafanaCredentials: z.string().describe('Grafana credentials JSON with baseUrl and optional apiToken'),
    }),
    execute: async ({ grafanaCredentials }) => {
        try {
            const result = await grafanaRequest(grafanaCredentials, '/store-gateway/tenants');

            if (!result.ok) {
                return {
                    error: 'Failed to get store gateway tenants',
                    details: result.data,
                    statusCode: result.status,
                };
            }

            return {
                content: result.data,
                contentType: result.contentType,
            };
        } catch (error) {
            return {
                error: 'Error getting store gateway tenants',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
