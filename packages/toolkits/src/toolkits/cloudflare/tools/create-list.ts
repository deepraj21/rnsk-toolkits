// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cfRequest, toCfError } from './client.js';

export const cloudflareCreateList = tool({
    description:
        'Create a new empty custom list (IP, hostname, ASN, or redirect) for use in WAF rules and filters. Add items to the list separately afterwards. List limits depend on plan.',
    inputSchema: z.object({
        cloudflareApiKey: z.string().optional().describe('Injected by system; do not provide'),
        accountId: z.string().describe('Account identifier that will own the list'),
        kind: z.enum(['ip', 'redirect', 'hostname', 'asn']).describe('List type'),
        name: z.string().max(50).describe('List name used in filter and rule expressions (max 50 chars)'),
        description: z.string().max(500).optional().describe('List description (max 500 chars)'),
    }),
    execute: async ({ cloudflareApiKey, accountId, kind, name, description }) => {
        try {
            if (!cloudflareApiKey) {
                return { error: 'Cloudflare API key is required. Connect Cloudflare first.' };
            }
            return await cfRequest(cloudflareApiKey, 'POST', `/accounts/${accountId}/rules/lists`, {
                body: { kind, name, description },
            });
        } catch (error) {
            return toCfError(error, 'Failed to create WAF list');
        }
    },
});
