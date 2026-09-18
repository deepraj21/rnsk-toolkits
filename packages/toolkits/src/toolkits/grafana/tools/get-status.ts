// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { grafanaRequest } from './utils.js';

export const getStatus = tool({
    description: 'Check if a valid Grafana Enterprise license is available on the instance.',
    inputSchema: z.object({
        grafanaCredentials: z.string().describe('Grafana credentials JSON with baseUrl and apiToken'),
    }),
    execute: async ({ grafanaCredentials }) => {
        try {
            const result = await grafanaRequest(grafanaCredentials, '/api/licensing/check', {
                acceptJson: true,
            });

            if (!result.ok) {
                return {
                    error: 'Failed to get license status',
                    details: result.data,
                    statusCode: result.status,
                };
            }

            const licenseAvailable =
                typeof result.data === 'boolean'
                    ? result.data
                    : result.data?.license_available ?? result.data?.licenseAvailable ?? false;

            return { licenseAvailable };
        } catch (error) {
            return {
                error: 'Error getting license status',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
