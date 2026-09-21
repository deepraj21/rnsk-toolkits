// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { REGISTRY_BASE, missingKey, npmApiKeyField, npmRequest } from './client.js';

export const queryBulkSecurityAdvisories = tool({
    description:
        'Bulk-checks vulnerabilities for multiple packages at once. Maps package names to version arrays; packages without issues return empty arrays.',
    inputSchema: z.object({
        packages: z.record(z.array(z.string())).describe("Package-to-versions map, e.g. {express:['4.17.1'],lodash:['4.17.20']}"),
    }),
    execute: async ({ packages }) =>
        npmRequest(REGISTRY_BASE, '/-/npm/v1/security/advisories/bulk', { method: 'POST', body: packages }),
});

export const deleteUserTokenLegacy = tool({
    description:
        'Revokes a user auth token via the legacy endpoint using its key from the token list. Provide npm OTP for 2FA accounts.',
    inputSchema: z.object({
        npmApiKey: npmApiKeyField,
        token: z.string().describe("Token key/UUID to delete, e.g. 'a1df1599-b022-4f1b-86c5-ee7a1df48f48'"),
        npmOtp: z.string().optional().describe('One-time password for 2FA accounts'),
    }),
    execute: async ({ npmApiKey, token, npmOtp }) => {
        if (!npmApiKey) return missingKey();
        return npmRequest(REGISTRY_BASE, `/-/user/token/${encodeURIComponent(token)}`, {
            method: 'DELETE',
            apiKey: npmApiKey,
            npmOtp,
        });
    },
});
