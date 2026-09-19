// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cfRequest, toCfError } from './client.js';

export const cloudflareCreateZone = tool({
    description:
        'Create a new DNS zone (domain) in Cloudflare. The zone stays pending until nameservers are updated at the registrar. Get the account ID via cloudflareListAccounts when needed.',
    inputSchema: z.object({
        cloudflareApiKey: z.string().optional().describe('Injected by system; do not provide'),
        name: z.string().describe('Domain name for the new zone, e.g. example.com'),
        type: z
            .enum(['full', 'partial', 'secondary'])
            .optional()
            .default('full')
            .describe('Setup mode: full, partial (CNAME), or secondary DNS'),
        accountId: z.string().optional().describe('Account ID to create the zone under (defaults to the token account)'),
        jumpStart: z.boolean().optional().describe('Auto-import existing DNS records (ignored for partial zones)'),
    }),
    execute: async ({ cloudflareApiKey, name, type = 'full', accountId, jumpStart }) => {
        try {
            if (!cloudflareApiKey) {
                return { error: 'Cloudflare API key is required. Connect Cloudflare first.' };
            }
            return await cfRequest(cloudflareApiKey, 'POST', '/zones', {
                body: {
                    name,
                    type,
                    account: accountId ? { id: accountId } : undefined,
                    jump_start: jumpStart,
                },
            });
        } catch (error) {
            return toCfError(error, 'Failed to create zone');
        }
    },
});
