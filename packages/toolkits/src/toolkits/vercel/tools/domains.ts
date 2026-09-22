// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { vercelFetch } from './client.js';

export const vercelAddProjectDomain = tool({
    description: 'Tool to attach a custom domain to a Vercel project. Use when you need to add a domain to a project for production or branch-specific deployments. After adding, the domain must be verified by completing the verification challenges returned in the response.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        name: z.string().describe('The domain name to add to the project (e.g., \'www.example.com\', \'app.mydomain.com\')'),
        slug: z.string().optional().describe('Team slug to perform the request on behalf of'),
        teamId: z.string().optional().describe('Team identifier to perform the request on behalf of'),
        idOrName: z.string().describe('The unique project identifier or project name'),
        redirect: z.string().optional().describe('Target destination domain for redirection. **PREREQUISITE: The target domain must already be added to the project first** (call this action without redirect parameters to add the target domain, then c'),
        gitBranch: z.string().optional().describe('Git branch to associate with this domain. When set, deployments from this branch will be accessible via this domain. Maximum 250 characters. IMPORTANT: Cannot be used together with \'redirect\' or \'r'),
        redirectStatusCode: z.number().optional().describe('HTTP status code for redirect. Required when \'redirect\' is set. 301: Permanent redirect (cached by browsers), 302: Temporary redirect, 307: Temporary redirect (preserves method), 308: Permanent redi'),
        customEnvironmentId: z.string().optional().describe('Custom environment identifier within the project to associate with this domain'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v10/projects/${p.idOrName}/domains`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Add Domain to Project failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelAddProjectDomain', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelBuyDomains = tool({
    description: 'Tool to purchase multiple domains through Vercel\'s domain registrar. Use when registering new domains after checking availability and price. Important: Always check domain availability and price before attempting purchase. Some TLDs may require additional contact information fields.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('Team slug to perform the request on behalf of'),
        teamId: z.string().optional().describe('Team identifier to perform the request on behalf of'),
        domains: z.array(z.record(z.any())).describe('List of domains to purchase. Must contain at least one domain.'),
        contactInformation: z.record(z.any()).describe('Contact information for domain registration. Some TLDs may require additional fields.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v5/domains/buy`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Buy Domains failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelBuyDomains', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelBuySingleDomain = tool({
    description: 'Tool to purchase a domain through Vercel\'s domain registrar. Use when you need to register and buy a domain after confirming availability and pricing.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        years: z.number().describe('Number of years to register the domain for'),
        domain: z.string().describe('The fully qualified domain name to purchase (e.g., example.com)'),
        teamId: z.string().optional().describe('Optional team ID to purchase the domain on behalf of a team'),
        autoRenew: z.boolean().describe('Whether the domain should be automatically renewed before it expires. Can be configured later via the Vercel Dashboard or API.'),
        expectedPrice: z.number().describe('Expected price in USD for the domain purchase. Use check_domain_price to get current pricing.'),
        contactInformation: z.record(z.any()).describe('Contact information for domain registration. Some TLDs require additional fields - use get_contact_info_schema endpoint to check requirements.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v4/domains/buy`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Buy Single Domain failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelBuySingleDomain', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelCheckDomainAvailability = tool({
    description: 'Tool to check if a domain is available for registration. Read-only: does not reserve or purchase the domain. Use when you need to verify domain availability before purchase. Response field `available=false` means the domain is taken (not an error); actual failures return HTTP 4xx. IMPORTANT: Vercel only supports specific TLDs. Common supported TLDs include: .com, .net, .org, .io, .co, .dev, .app, .ai, .xyz, .me. Some TLDs are NOT supported (e.g., .cam, .berlin, .wales). For the full list, see: https://vercel.com/docs/domains/supported-domains',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('Optional team slug to perform the request on behalf of.'),
        domain: z.string().describe('The domain name to check for availability (e.g., \'example.com\'). Can also be passed as \'domain\'. IMPORTANT: Only domains with Vercel-supported TLDs can be checked. Common supported TLDs include: .'),
        teamId: z.string().optional().describe('Optional team identifier to perform the request on behalf of. Can also be passed as \'team\'.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v4/domains/status`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Check Domain Availability failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelCheckDomainAvailability', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelCheckDomainPrice = tool({
    description: 'DEPRECATED: Use VERCEL_CHECK_DOMAIN_PRICE2 instead. Tool to check the price for a domain before purchase. Use when evaluating cost and availability prior to domain registration.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        years: z.number().optional().describe('Number of years to get pricing for. If omitted, uses the minimum years for the TLD.'),
        domain: z.string().describe('Fully qualified domain name to check price for'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v4/domains/price`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Check Domain Price (Deprecated) failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelCheckDomainPrice', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelCheckDomainPrice2 = tool({
    description: 'Check pricing for a domain including purchase, renewal, and transfer costs. Use this to evaluate the cost of registering, renewing, or transferring a domain via Vercel. Returns pricing for the specified domain and time period.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        years: z.number().optional().describe('The number of years to get the price for. If not provided, the minimum number of years for the TLD will be used (typically 1 year).'),
        domain: z.string().describe('The domain name to check pricing for (e.g., \'example.com\', \'mysite.io\').'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of (e.g., \'team_1a2b3c4d5e6f7g8h9i0j1k2l\').'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v4/domains/price`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Check Domain Price failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelCheckDomainPrice2', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelCreateDnsRecord = tool({
    description: 'Tool to create a new DNS record for a domain. Use when you need to add DNS records such as A, AAAA, CNAME, MX, TXT, SRV, or other record types to a domain managed in Vercel.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        srv: z.record(z.any()).optional().describe('Configuration for SRV record type.'),
        ttl: z.number().optional().describe('The Time to live (TTL) value of the DNS record in seconds. Must be between 60 and 2147483647. If not specified, a default TTL will be used.'),
        name: z.string().describe('The name/subdomain for the DNS record. Use \'@\' for the root domain or provide a subdomain like \'www\' or \'api\'.'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        type: z.string().describe('The type of DNS record to create'),
        https: z.record(z.any()).optional().describe('Configuration for HTTPS record type.'),
        value: z.string().optional().describe('The value of the DNS record. Required for A, AAAA, ALIAS, CAA, CNAME, MX, TXT, and NS record types. Not used for SRV and HTTPS records which use their respective config objects.'),
        domain: z.string().describe('The domain used to create the DNS record (e.g., \'example.com\')'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        comment: z.string().optional().describe('A comment to add context on what this DNS record is for. Maximum 500 characters.'),
        mxPriority: z.number().optional().describe('The MX priority value. Required when record type is MX.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v2/domains/${p.domain}/records`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Create DNS Record failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelCreateDnsRecord', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelCreateOrTransferDomain = tool({
    description: 'Tool to add an existing domain to the Vercel platform. Use when you need to add a domain to Vercel for DNS management or transfer a domain. Supports two methods: \'add\' for adding existing domains and \'move-in\' for transferring domains (requires authorization token).',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        name: z.string().describe('The domain name to add or transfer (e.g., \'example.com\')'),
        slug: z.string().optional().describe('Team slug to perform the request on behalf of'),
        zone: z.boolean().optional().describe('Whether to create a DNS zone for the domain. Only applicable when method is \'add\'.'),
        token: z.string().optional().describe('Authorization token required when method is \'move-in\' for domain transfer. Not used for \'add\' method.'),
        method: z.string().optional().describe('The domain operation to perform. Use \'add\' to add an existing domain or \'move-in\' to transfer a domain. When using \'move-in\', the \'token\' field is required. If not specified, defaults to \'add'),
        teamId: z.string().optional().describe('Team identifier to perform the request on behalf of'),
        cdnEnabled: z.boolean().optional().describe('Whether to enable CDN for the domain. Only applicable when method is \'add\'.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v4/domains`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Create or Transfer Domain failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelCreateOrTransferDomain', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelDeleteDnsRecord = tool({
    description: 'Tool to delete a DNS record from a domain. Use when you need to remove an existing DNS record by its record ID and domain name.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        domain: z.string().describe('The domain name that contains the DNS record to delete (e.g., \'example.com\')'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        recordId: z.string().describe('The unique identifier of the DNS record to delete. You can obtain this ID by listing DNS records for the domain using the VERCEL_GET_DNS_RECORDS action.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v2/domains/${p.domain}/records/${p.recordId}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'DELETE', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Delete DNS Record failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelDeleteDnsRecord', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelDeleteDomain = tool({
    description: 'Tool to remove a domain by name from Vercel. Use when you need to delete a domain that is no longer needed.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        domain: z.string().describe('The name of the domain to delete.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v5/domains/${p.domain}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'DELETE', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Delete Domain failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelDeleteDomain', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetDomain = tool({
    description: 'Tool to retrieve complete information for a single domain. Use when you need to check domain details, ownership verification status, nameserver configuration, or domain service type.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        domain: z.string().describe('The name of the domain (e.g., \'example.com\').'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v5/domains/${p.domain}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Domain Information failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetDomain', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetDomainConfig = tool({
    description: 'Tool to get a domain\'s configuration details from Vercel. Use when you need to check how a domain is configured, what DNS records are recommended, or verify domain setup. Returns configuration status, accepted SSL challenges, and recommended DNS records (CNAME and IPv4).',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        domain: z.string().describe('The name of the domain to get configuration for'),
        strict: z.string().optional().describe('When true, the response will only include the nameservers assigned directly to the specified domain. When false and there are no nameservers assigned directly to the specified domain, the response wil'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        projectIdOrName: z.string().optional().describe('The project id or name that will be associated with the domain. Use this when the domain is not yet associated with a project.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v6/domains/${p.domain}/config`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Domain Configuration failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetDomainConfig', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetDomainTransferInfo = tool({
    description: 'Tool to get information required to transfer a domain to Vercel. Use when you need to check transfer availability or current status before initiating a transfer.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('Optional Vercel Team slug to perform the request on behalf of.'),
        domain: z.string().describe('The domain name to check transfer info for (e.g., \'example.com\')'),
        teamId: z.string().optional().describe('Optional Vercel Team ID to perform the request on behalf of.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v5/domains/${p.domain}/transfer-info`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Domain Transfer Info failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetDomainTransferInfo', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetProjectDomain = tool({
    description: 'Tool to retrieve details about a specific domain attached to a Vercel project. Use when you need to check domain configuration, verification status, redirect settings, or git branch associations.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('Team slug to perform the request on behalf of'),
        domain: z.string().describe('The project domain name to retrieve (e.g., \'www.example.com\')'),
        teamId: z.string().optional().describe('Team identifier to perform the request on behalf of'),
        idOrName: z.string().describe('The unique project identifier or project name'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v9/projects/${p.idOrName}/domains/${p.domain}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Project Domain failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetProjectDomain', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetProjectDomains = tool({
    description: 'Tool to retrieve all domains attached to a Vercel project. Use when you need to verify domain configuration, check verification status, audit redirect/branch bindings, or before performing domain operations.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('Team URL slug to perform the request on behalf of.'),
        limit: z.number().optional().describe('Maximum number of domains to return per request. Maximum value is 100.'),
        order: z.string().optional().describe('Sort order by creation date. \'ASC\' for ascending, \'DESC\' for descending. Default is \'DESC\'.'),
        since: z.number().optional().describe('Returns domains created after this JavaScript timestamp in milliseconds.'),
        until: z.number().optional().describe('Returns domains created before this JavaScript timestamp in milliseconds.'),
        target: z.string().optional().describe('Filters by domain target. Use \'production\' for production domains or \'preview\' for preview domains.'),
        teamId: z.string().optional().describe('Team identifier to perform the request on behalf of. Omit for personal account.'),
        idOrName: z.string().describe('The project\'s unique identifier or project name.'),
        redirect: z.string().optional().describe('Filters domains by their redirect target domain name.'),
        verified: z.boolean().optional().describe('Filters by verification status. Set to true for verified domains only, false for unverified.'),
        gitBranch: z.string().optional().describe('Filters domains based on a specific git branch.'),
        redirects: z.boolean().optional().describe('Controls redirect domain inclusion. Set to true to include redirect domains, false to exclude. Default is true.'),
        production: z.boolean().optional().describe('Filters domains by production status. Set to true for production domains, false for non-production.'),
        customEnvironmentId: z.string().optional().describe('The unique custom environment identifier within the project to filter domains.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v9/projects/${p.idOrName}/domains`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'List Project Domains failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetProjectDomains', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetTldInfo = tool({
    description: 'Tool to get information about a specific top-level domain (TLD). Use when you need to check supported language codes for domain registration.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        tld: z.string().describe('The top-level domain (TLD) to get information for. Examples include: \'com\', \'net\', \'org\', \'io\', \'dev\', \'app\', etc. Do not include the leading dot (use \'com\' not \'.com\').'),
        teamId: z.string().optional().describe('Optional Vercel Team ID to perform the request on behalf of.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v5/domains/tld/${p.tld}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get TLD Info failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetTldInfo', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetTldPrice = tool({
    description: 'Tool to get pricing information for a specific top-level domain (TLD). Use when you need to check domain registration, renewal, or transfer costs.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        tld: z.string().describe('The top-level domain (TLD) to get pricing for. Examples include: \'com\', \'net\', \'org\', \'io\', \'dev\', \'app\', etc. Do not include the leading dot (use \'com\' not \'.com\').'),
        years: z.number().optional().describe('The number of years to get the price for. If not provided, the minimum number of years for the TLD will be used.'),
        teamId: z.string().optional().describe('Optional Vercel Team ID to perform the request on behalf of.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v5/domains/tld/${p.tld}/price`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get TLD Price failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetTldPrice', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelListDnsRecords = tool({
    description: 'Tool to list existing DNS records for a domain. Use when you need to retrieve, audit, or verify DNS configuration for a domain managed in Vercel.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        limit: z.string().optional().describe('Maximum number of records to list from a request. Default is 20, maximum is 100.'),
        since: z.string().optional().describe('Get records created after this JavaScript timestamp in milliseconds.'),
        until: z.string().optional().describe('Get records created before this JavaScript timestamp in milliseconds.'),
        domain: z.string().describe('The domain name to retrieve DNS records for'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v4/domains/${p.domain}/records`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'List DNS Records failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelListDnsRecords', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelListDomains = tool({
    description: 'Tool to list all domains from Vercel. Use this to retrieve domain information including verification status, nameservers, and ownership details.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        limit: z.number().optional().describe('Maximum number of domains to list from a request.'),
        since: z.number().optional().describe('Get domains created after this JavaScript timestamp.'),
        until: z.number().optional().describe('Get domains created before this JavaScript timestamp.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v5/domains`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Domains failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelListDomains', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelListSupportedTlds = tool({
    description: 'Tool to retrieve all TLDs (top-level domains) supported by Vercel for domain registration. Use when you need to verify if a specific TLD is supported or to display available domain extensions.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        teamId: z.string().optional().describe('Optional team identifier to perform the request on behalf of.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v5/domains/tlds`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Supported TLDs failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelListSupportedTlds', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelMoveProjectDomain = tool({
    description: 'Tool to move a domain from one Vercel project to another. Use when you need to transfer domain ownership between projects.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('Team slug to perform the request on behalf of'),
        domain: z.string().describe('The project domain name to move (e.g., \'www.example.com\')'),
        teamId: z.string().optional().describe('Team identifier to perform the request on behalf of'),
        idOrName: z.string().describe('The unique project identifier or project name of the source project'),
        redirect: z.string().optional().describe('Target destination domain for redirection. When set, requests to this domain will redirect to the specified target domain.'),
        gitBranch: z.string().optional().describe('Git branch to associate with this domain in the target project. When set, deployments from this branch will be accessible via this domain. Maximum 250 characters.'),
        projectId: z.string().describe('The unique identifier of the target project to move the domain to'),
        redirectStatusCode: z.number().optional().describe('HTTP status code for redirect. 301: Permanent redirect (cached by browsers), 302: Temporary redirect, 307: Temporary redirect (preserves method), 308: Permanent redirect (preserves method).'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v9/projects/${p.idOrName}/domains/${p.domain}/move`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Move Project Domain failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelMoveProjectDomain', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelRemoveProjectDomain = tool({
    description: 'Tool to remove a domain from a Vercel project. Use when you need to detach a domain from a project or clean up domain associations.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        domain: z.string().describe('The project domain name to remove (e.g., \'www.example.com\')'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        idOrName: z.string().describe('The unique project identifier or the project name'),
        removeRedirects: z.boolean().optional().describe('Whether to remove all domains from this project that redirect to the domain being removed.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v9/projects/${p.idOrName}/domains/${p.domain}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'DELETE', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Remove Domain from Project failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelRemoveProjectDomain', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelTransferInDomain = tool({
    description: 'Tool to transfer a domain to Vercel from another registrar. Use when you need to migrate domain registration to Vercel. Before transferring, obtain the authorization code from the current registrar and verify the domain is unlocked and eligible for transfer.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        years: z.number().describe('Number of years to renew the domain for after transfer. Must be valid for the TLD.'),
        domain: z.string().describe('The domain name to transfer in (e.g., \'example.com\')'),
        teamId: z.string().optional().describe('Team ID to perform the transfer on behalf of'),
        authCode: z.string().describe('Authorization code for the domain transfer. Obtain this code from the current (losing) registrar.'),
        autoRenew: z.boolean().describe('Whether the domain should automatically renew before expiration. Can be changed later via the Vercel Dashboard or API.'),
        expectedPrice: z.number().describe('Expected transfer price in USD. Use this to prevent unexpected charges if the price changes between checking and transferring.'),
        contactInformation: z.record(z.any()).describe('Contact information for domain registration. All fields except address2, company_name, and fax are required.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v5/domains/transfer-in`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Transfer In Domain failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelTransferInDomain', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelUpdateDnsRecord = tool({
    description: 'Tool to update an existing DNS record. Use when you need to modify DNS record properties such as value, name, type, TTL, or comment. Ensure you have the record ID before calling this action.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        srv: z.record(z.any()).optional().describe('Configuration for SRV record type.'),
        ttl: z.number().optional().describe('The Time to live (TTL) value of the DNS record in seconds. Must be between 60 and 2147483647.'),
        name: z.string().optional().describe('The name of the DNS record. Provide to update the record name.'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        type: z.string().optional().describe('The type of the DNS record. Provide to change the record type.'),
        https: z.record(z.any()).optional().describe('Configuration for HTTPS record type.'),
        value: z.string().optional().describe('The value of the DNS record. Provide to update the record value.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        comment: z.string().optional().describe('A comment to add context on what this DNS record is for. Maximum 500 characters.'),
        recordId: z.string().describe('The unique identifier of the DNS record to update'),
        mxPriority: z.number().optional().describe('The MX priority value of the DNS record. Required when record type is MX.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/dns/${p.recordId}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'PATCH', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Update DNS Record failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelUpdateDnsRecord', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelUpdateDomain = tool({
    description: 'Tool to update or move an apex domain on Vercel. Use when you need to modify domain configuration (zone settings) or transfer a domain to another team. For \'update\' operation, you can modify the zone configuration. For \'move-out\' operation, provide a destination team ID.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        op: z.string().describe('The operation to perform. Use \'update\' to modify domain configuration (zone, renew, customNameservers), or \'move-out\' to transfer the domain to another team/account.'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        zone: z.boolean().optional().describe('Whether to enable Vercel DNS zone configuration for the domain (uses Vercel\'s nameservers). Only applicable when op=\'update\'. For \'update\' operation, at least one of zone, renew, or customNameser'),
        renew: z.boolean().optional().describe('Whether to renew the domain. Only applicable when op=\'update\'. Note: This field is deprecated.'),
        domain: z.string().describe('The domain name to update or move (e.g., \'example.com\')'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        destination: z.string().optional().describe('The destination team ID to transfer the domain to. Required when op=\'move-out\'.'),
        customNameservers: z.array(z.string()).optional().describe('List of custom nameservers for the domain. Only applicable when op=\'update\'. Note: This field is deprecated.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v5/domains/${p.domain}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'PATCH', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Patch Domain failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelUpdateDomain', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelUpdateProjectDomain = tool({
    description: 'Tool to update a project domain in Vercel. Use when you need to modify domain settings such as git branch association, redirects, or redirect status codes for an existing project domain.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('Team slug to perform the request on behalf of'),
        domain: z.string().describe('The project domain name to update (e.g., \'www.example.com\', \'api.mytest-domain.io\')'),
        teamId: z.string().optional().describe('Team identifier to perform the request on behalf of'),
        idOrName: z.string().describe('The unique project identifier or project name'),
        redirect: z.string().optional().describe('Target destination domain for redirect. When set, requests to this domain will redirect to the specified target domain. Set to null to remove redirect.'),
        gitBranch: z.string().optional().describe('Git branch to link the project domain. When set, deployments from this branch will be accessible via this domain. Set to null to unlink the branch. Maximum 250 characters.'),
        redirectStatusCode: z.number().optional().describe('HTTP status code for redirect. Required when \'redirect\' is set. 301: Permanent redirect (cached by browsers), 302: Temporary redirect, 307: Temporary redirect (preserves method), 308: Permanent redi'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v9/projects/${p.idOrName}/domains/${p.domain}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'PATCH', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Update Project Domain failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelUpdateProjectDomain', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelVerifyProjectDomain = tool({
    description: 'Attempts to verify a project domain by checking if DNS challenges are correctly configured. Call this after adding a domain to a project and setting up the required DNS TXT records. Returns verified=true if DNS is correctly configured, or an error with the required DNS records if verification fails.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        domain: z.string().describe('The domain name to verify. This domain must have been previously added to the project and have the required DNS TXT records configured. Use VERCEL_GET_PROJECT_DOMAINS to see pending verifications.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        idOrName: z.string().describe('The unique project identifier (e.g., \'prj_12HKQaOmR5t5Uy6vdcQsNIiZgHGB\') or the project name (e.g., \'my-project\'). The domain must already be added to this project before verification.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v9/projects/${p.idOrName}/domains/${p.domain}/verify`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Verify Project Domain failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelVerifyProjectDomain', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});
