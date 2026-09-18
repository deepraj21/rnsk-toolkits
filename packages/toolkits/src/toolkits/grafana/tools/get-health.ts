// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { grafanaRequest } from './utils.js';

export const getHealth = tool({
    description:
        'Check Grafana server health and database connectivity. Returns ok if the web server is running and can access the database.',
    inputSchema: z.object({
        grafanaCredentials: z.string().describe('Grafana credentials JSON with baseUrl and optional apiToken'),
    }),
    execute: async ({ grafanaCredentials }) => {
        try {
            const result = await grafanaRequest(grafanaCredentials, '/api/health', {
                acceptJson: true,
            });

            if (!result.ok) {
                return {
                    error: 'Failed to get Grafana health status',
                    details: result.data,
                    statusCode: result.status,
                };
            }

            return result.data;
        } catch (error) {
            return {
                error: 'Error getting Grafana health status',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
