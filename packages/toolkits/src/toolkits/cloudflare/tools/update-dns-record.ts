// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cfRequest, toCfError } from './client.js';

export const cloudflareUpdateDnsRecord = tool({
    description:
        'Update an existing DNS record. Only provided fields are modified. Confirm zone and record IDs first via cloudflareListZones and cloudflareListDnsRecords. Changes to records used by active tunnels take effect immediately.',
    inputSchema: z.object({
        cloudflareApiKey: z.string().optional().describe('Injected by system; do not provide'),
        zoneId: z.string().describe('Zone identifier of the record'),
        recordId: z.string().describe('DNS record identifier to update'),
        type: z
            .enum([
                'A', 'AAAA', 'CNAME', 'CERT', 'DNSKEY', 'DS', 'LOC', 'MX', 'NS', 'PTR',
                'SPF', 'SRV', 'SSHFP', 'TLSA', 'TXT', 'URI',
            ])
            .optional()
            .describe('DNS record type'),
        name: z.string().optional().describe('DNS record name'),
        content: z.string().optional().describe('DNS record content'),
        ttl: z.number().min(1).optional().describe('TTL in seconds; 1 for automatic'),
        proxied: z.boolean().optional().describe('Route through Cloudflare proxy'),
        priority: z.number().min(0).optional().describe('Priority for MX, SRV, and URI records'),
        data: z.record(z.any()).optional().describe('Extra data for LOC, SRV, and CAA records'),
    }),
    execute: async ({ cloudflareApiKey, zoneId, recordId, ...patch }) => {
        try {
            if (!cloudflareApiKey) {
                return { error: 'Cloudflare API key is required. Connect Cloudflare first.' };
            }
            return await cfRequest(cloudflareApiKey, 'PATCH', `/zones/${zoneId}/dns_records/${recordId}`, {
                body: patch,
            });
        } catch (error) {
            return toCfError(error, 'Failed to update DNS record');
        }
    },
});
