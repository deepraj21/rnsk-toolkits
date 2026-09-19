// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cfRequest, toCfError } from './client.js';

export const cloudflareListFirewallRules = tool({
    description:
        'List firewall rules for a zone. Use to audit current firewall configuration. Does not expose Workers routes or other routing constructs.',
    inputSchema: z.object({
        cloudflareApiKey: z.string().optional().describe('Injected by system; do not provide'),
        zoneId: z.string().describe('Zone identifier to list firewall rules for'),
        match: z.enum(['all', 'any']).optional().describe('Match criteria when multiple filters are provided'),
        order: z.string().optional().describe('Field to order by, e.g. priority or created_on'),
        direction: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
        page: z.number().min(1).optional().describe('Page number, starting from 1'),
        perPage: z.number().min(1).max(1000).optional().describe('Rules per page (1-1000)'),
    }),
    execute: async ({ cloudflareApiKey, zoneId, perPage, ...filters }) => {
        try {
            if (!cloudflareApiKey) {
                return { error: 'Cloudflare API key is required. Connect Cloudflare first.' };
            }
            return await cfRequest(cloudflareApiKey, 'GET', `/zones/${zoneId}/firewall/rules`, {
                query: { ...filters, per_page: perPage },
            });
        } catch (error) {
            return toCfError(error, 'Failed to list firewall rules');
        }
    },
});
