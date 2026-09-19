// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { hostingerRequest } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const hostingerGetDnsRecords = tool({
    description:
        'Get DNS zone records for a domain. Use to review current DNS configuration, check propagation after updates, or audit DNS settings.',
    inputSchema: z.object({
        hostingerApiKey: tokenField,
        domain: z.string().describe('Domain name, e.g. "mydomain.tld"'),
    }),
    execute: async ({ hostingerApiKey, domain }) => {
        return hostingerRequest(hostingerApiKey, `/api/dns/v1/zones/${encodeURIComponent(domain)}`);
    },
});

const zoneEntry = z.object({
    name: z.string().describe('Subdomain or hostname, e.g. "www"'),
    type: z.string().describe('Record type, e.g. "A", "AAAA", "CNAME", "MX", "TXT", "NS"'),
    ttl: z.number().int().min(0).optional().describe('Time to live in seconds'),
    records: z.array(z.object({ content: z.string().describe('Record content, e.g. IP address or hostname') })).min(1).describe('DNS records for this entry'),
});

export const hostingerValidateDnsRecords = tool({
    description:
        'Validate DNS zone records for a domain before applying an update. Use to verify record validity; success returns 200, invalid records fail with 422.',
    inputSchema: z.object({
        hostingerApiKey: tokenField,
        domain: z.string().describe('Domain name, e.g. "example.com"'),
        zone: z.array(zoneEntry).min(1).describe('DNS zone entries to validate'),
        overwrite: z.boolean().optional().describe('When true, matching records are replaced; otherwise TTLs are updated and records appended'),
    }),
    execute: async ({ hostingerApiKey, domain, zone, overwrite }) => {
        return hostingerRequest(hostingerApiKey, `/api/dns/v1/zones/${encodeURIComponent(domain)}/validate`, {
            method: 'POST',
            body: { zone, overwrite },
        });
    },
});

export const hostingerListDnsSnapshots = tool({
    description:
        'List DNS snapshots (backup points) for a domain. Use to find restore points for DNS recovery or audit history.',
    inputSchema: z.object({
        hostingerApiKey: tokenField,
        domain: z.string().describe('Domain name, e.g. "mydomain.tld"'),
    }),
    execute: async ({ hostingerApiKey, domain }) => {
        return hostingerRequest(hostingerApiKey, `/api/dns/v1/snapshots/${encodeURIComponent(domain)}`);
    },
});
