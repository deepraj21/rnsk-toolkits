// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cfRequest, toCfError } from './client.js';

export const cloudflareDeleteDnsRecord = tool({
    description:
        'Delete a DNS record. Deletion is immediate and irreversible — confirm zone and record IDs with the user first.',
    inputSchema: z.object({
        cloudflareApiKey: z.string().optional().describe('Injected by system; do not provide'),
        zoneId: z.string().describe('Zone identifier of the record'),
        recordId: z.string().describe('DNS record identifier to delete'),
    }),
    execute: async ({ cloudflareApiKey, zoneId, recordId }) => {
        try {
            if (!cloudflareApiKey) {
                return { error: 'Cloudflare API key is required. Connect Cloudflare first.' };
            }
            return await cfRequest(cloudflareApiKey, 'DELETE', `/zones/${zoneId}/dns_records/${recordId}`);
        } catch (error) {
            return toCfError(error, 'Failed to delete DNS record');
        }
    },
});
