// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { grafanaRequest } from './utils.js';

export const getRulerRing = tool({
    description: 'Retrieve ruler hash ring status including state, health, and last heartbeat of each ruler node.',
    inputSchema: z.object({
        grafanaCredentials: z.string().describe('Grafana credentials JSON with baseUrl and optional apiToken'),
    }),
    execute: async ({ grafanaCredentials }) => {
        try {
            const result = await grafanaRequest(grafanaCredentials, '/ruler/ring');

            if (!result.ok) {
                return {
                    error: 'Failed to get ruler ring status',
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
                error: 'Error getting ruler ring status',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
