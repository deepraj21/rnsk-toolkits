// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cfRequest, toCfError } from './client.js';

export const cloudflareCreateDnsRecord = tool({
    description:
        'Create a new DNS record in a zone. Makes live changes — get the zone ID first via cloudflareListZones. Confirm type, name, and content with the user before executing.',
    inputSchema: z.object({
        cloudflareApiKey: z.string().optional().describe('Injected by system; do not provide'),
        zoneId: z.string().describe('Zone identifier where the record will be created'),
        type: z.enum(['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV', 'LOC', 'CAA']).describe('DNS record type'),
        name: z.string().describe('DNS record name, e.g. example.com or www.example.com'),
        content: z.string().describe('Record content, e.g. an IP for A records'),
        ttl: z.number().min(1).optional().describe('TTL in seconds; use 1 for automatic'),
        proxied: z.boolean().optional().describe('Route through Cloudflare proxy'),
        priority: z.number().min(0).optional().describe('Priority for MX, SRV, and URI records'),
        comment: z.string().optional().describe('Human-readable comment for the record'),
        tags: z.array(z.string()).optional().describe('Tags to associate with the record'),
        data: z.record(z.any()).optional().describe('Extra data for SRV, LOC, or CAA records'),
    }),
    execute: async ({ cloudflareApiKey, zoneId, ...record }) => {
        try {
            if (!cloudflareApiKey) {
                return { error: 'Cloudflare API key is required. Connect Cloudflare first.' };
            }
            return await cfRequest(cloudflareApiKey, 'POST', `/zones/${zoneId}/dns_records`, { body: record });
        } catch (error) {
            return toCfError(error, 'Failed to create DNS record');
        }
    },
});
