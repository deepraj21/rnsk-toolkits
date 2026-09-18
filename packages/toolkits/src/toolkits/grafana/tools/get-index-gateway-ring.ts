// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { grafanaRequest } from './utils.js';

export const getIndexGatewayRing = tool({
    description: 'Retrieve index gateway hash ring status including state, health, and last heartbeat of each node.',
    inputSchema: z.object({
        grafanaCredentials: z.string().describe('Grafana credentials JSON with baseUrl and optional apiToken'),
    }),
    execute: async ({ grafanaCredentials }) => {
        try {
            const result = await grafanaRequest(grafanaCredentials, '/indexgateway/ring');

            if (!result.ok) {
                return {
                    error: 'Failed to get index gateway ring status',
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
                error: 'Error getting index gateway ring status',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
