// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { hostingerRequest } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const hostingerCheckDomainAvailability = tool({
    description:
        'Check if domain names are available for registration across multiple TLDs. Use before purchasing a domain. Provide TLDs without a leading dot. Rate limited to 10 requests per minute.',
    inputSchema: z.object({
        hostingerApiKey: tokenField,
        domain: z.string().describe('Domain name without TLD, e.g. "mydomain"'),
        tlds: z.array(z.string()).min(1).describe('TLDs to check without leading dot, e.g. ["com", "net"]'),
        withAlternatives: z.boolean().optional().describe('Include alternative domain suggestions (provide only one TLD when true)'),
    }),
    execute: async ({ hostingerApiKey, domain, tlds, withAlternatives }) => {
        return hostingerRequest(hostingerApiKey, '/api/domains/v1/availability', {
            method: 'POST',
            body: { domain, tlds, with_alternatives: withAlternatives },
        });
    },
});

export const hostingerListDomains = tool({
    description:
        'List all domains in the Hostinger account portfolio. Use when the user asks to see their domains or domain portfolio.',
    inputSchema: z.object({
        hostingerApiKey: tokenField,
    }),
    execute: async ({ hostingerApiKey }) => {
        return hostingerRequest(hostingerApiKey, '/api/domains/v1/portfolio');
    },
});

export const hostingerGetDomainForwarding = tool({
    description:
        'Get the forwarding (redirect) configuration for a domain, including target URL and redirect type (301/302).',
    inputSchema: z.object({
        hostingerApiKey: tokenField,
        domain: z.string().describe('Domain name, e.g. "mydomain.tld"'),
    }),
    execute: async ({ hostingerApiKey, domain }) => {
        return hostingerRequest(hostingerApiKey, `/api/domains/v1/forwarding/${encodeURIComponent(domain)}`);
    },
});

export const hostingerGenerateFreeSubdomain = tool({
    description:
        'Generate a free *.hostingersite.com subdomain for hosting without buying a custom domain. Use when the user wants a quick free subdomain.',
    inputSchema: z.object({
        hostingerApiKey: tokenField,
    }),
    execute: async ({ hostingerApiKey }) => {
        return hostingerRequest(hostingerApiKey, '/api/hosting/v1/domains/free-subdomains', { method: 'POST' });
    },
});

export const hostingerVerifyDomainOwnership = tool({
    description:
        'Verify ownership of a domain and check if it is accessible for new websites. If not accessible, the response includes a TXT record to add to DNS. Skip for *.hostingersite.com subdomains.',
    inputSchema: z.object({
        hostingerApiKey: tokenField,
        domain: z.string().describe('Domain name to verify, e.g. "example.com"'),
    }),
    execute: async ({ hostingerApiKey, domain }) => {
        return hostingerRequest(hostingerApiKey, '/api/hosting/v1/domains/verify-ownership', {
            method: 'POST',
            body: { domain },
        });
    },
});
