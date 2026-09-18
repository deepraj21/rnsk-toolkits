// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { grafanaRequest } from './utils.js';

export const postAcs = tool({
    description:
        'Perform SAML Assertion Consumer Service (ACS) operation when processing authentication responses from an identity provider.',
    inputSchema: z.object({
        grafanaCredentials: z.string().describe('Grafana credentials JSON with baseUrl'),
        samlResponse: z
            .string()
            .describe('Base64-encoded SAML Response from the Identity Provider'),
        relayState: z
            .string()
            .optional()
            .describe('Optional relay state parameter for the SAML authentication flow'),
    }),
    execute: async ({ grafanaCredentials, samlResponse, relayState }) => {
        try {
            const params = new URLSearchParams({ SAMLResponse: samlResponse });
            if (relayState) {
                params.set('RelayState', relayState);
            }

            const result = await grafanaRequest(grafanaCredentials, '/login/saml/acs', {
                method: 'POST',
                body: params.toString(),
                contentType: 'application/x-www-form-urlencoded',
            });

            return {
                statusCode: result.status,
                message:
                    result.status === 302
                        ? 'SAML ACS processed successfully with redirect'
                        : 'SAML ACS request completed',
                location: result.headers?.location ?? result.headers?.Location,
            };
        } catch (error) {
            return {
                error: 'Error performing SAML ACS operation',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
