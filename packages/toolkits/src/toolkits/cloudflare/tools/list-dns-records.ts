// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cfRequest, toCfError } from './client.js';

export const cloudflareListDnsRecords = tool({
    description:
        'List and search DNS records in a zone. Use to find record IDs for update or delete operations, e.g. after a "record already exists" error. Supports filtering by type, name, and content with pagination.',
    inputSchema: z.object({
        cloudflareApiKey: z.string().optional().describe('Injected by system; do not provide'),
        zoneId: z.string().describe('Zone identifier to list DNS records from'),
        type: z
            .enum([
                'A', 'AAAA', 'CAA', 'CERT', 'CNAME', 'DNSKEY', 'DS', 'HTTPS', 'LOC', 'MX',
                'NAPTR', 'NS', 'PTR', 'SMIMEA', 'SRV', 'SSHFP', 'SVCB', 'TLSA', 'TXT', 'URI',
            ])
            .optional()
            .describe('Filter by exact record type'),
        name: z.string().optional().describe('Filter by exact record name (FQDN)'),
        content: z.string().optional().describe('Filter by exact record content'),
        nameContains: z.string().optional().describe('Filter by names containing this substring'),
        contentContains: z.string().optional().describe('Filter by content containing this substring'),
        commentContains: z.string().optional().describe('Filter by comments containing this substring'),
        proxied: z.boolean().optional().describe('Filter by proxy status'),
        match: z.enum(['all', 'any']).optional().describe('Require all filters (AND) or any filter (OR) to match'),
        page: z.number().min(1).optional().describe('Page number, starting from 1'),
        perPage: z.number().min(1).optional().describe('Records per page'),
    }),
    execute: async ({
        cloudflareApiKey,
        zoneId,
        nameContains,
        contentContains,
        commentContains,
        perPage,
        ...filters
    }) => {
        try {
            if (!cloudflareApiKey) {
                return { error: 'Cloudflare API key is required. Connect Cloudflare first.' };
            }
            return await cfRequest(cloudflareApiKey, 'GET', `/zones/${zoneId}/dns_records`, {
                query: {
                    ...filters,
                    per_page: perPage,
                    'name.contains': nameContains,
                    'content.contains': contentContains,
                    'comment.contains': commentContains,
                },
            });
        } catch (error) {
            return toCfError(error, 'Failed to list DNS records');
        }
    },
});
