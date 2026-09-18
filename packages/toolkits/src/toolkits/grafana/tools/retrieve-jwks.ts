// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { grafanaRequest } from './utils.js';

export const retrieveJwks = tool({
    description:
        'Retrieve JSON Web Key Set (JWKS) with all public keys that can be used to verify JWT tokens.',
    inputSchema: z.object({
        grafanaCredentials: z.string().describe('Grafana credentials JSON with baseUrl'),
    }),
    execute: async ({ grafanaCredentials }) => {
        try {
            const result = await grafanaRequest(grafanaCredentials, '/api/signing-keys/keys', {
                acceptJson: true,
            });

            if (!result.ok) {
                return {
                    error: 'Failed to retrieve JWKS',
                    details: result.data,
                    statusCode: result.status,
                };
            }

            return result.data;
        } catch (error) {
            return {
                error: 'Error retrieving JWKS',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
