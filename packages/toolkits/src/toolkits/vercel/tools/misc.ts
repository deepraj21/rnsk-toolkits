// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { vercelFetch } from './client.js';

export const vercelDangerouslyDeleteBySrcImages = tool({
    description: 'Tool to dangerously delete edge cache by source image URLs. Use when you need to invalidate cached images from the edge network for a specific project.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        srcImages: z.array(z.string()).describe('List of source image URLs to delete from edge cache. Must contain 1-8 URLs, each up to 8192 characters.'),
        projectIdOrName: z.string().describe('The unique identifier or name of the project.'),
        revalidationDeadlineSeconds: z.number().optional().describe('Optional deadline in seconds for revalidation. Must be non-negative.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/projects/${p.projectIdOrName}/cache/images`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Dangerously Delete By Source Images failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelDangerouslyDeleteBySrcImages', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelDangerouslyDeleteByTags = tool({
    description: 'Tool to dangerously delete edge cache by tags. Use when you need to purge cached content for specific cache tags in a Vercel project. WARNING: This permanently deletes cached content and cannot be undone.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        tags: z.string().describe('Cache tags to purge. Can be a single tag string or a list of tag strings. All cached content matching these tags will be permanently deleted.'),
        target: z.string().optional().describe('Target environment to purge cache from. Either \'production\' or \'preview\'.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        projectIdOrName: z.string().describe('The project ID or name to purge cache for. This is required and must be a valid project identifier.'),
        revalidationDeadlineSeconds: z.number().optional().describe('Optional deadline in seconds for revalidation. Must be non-negative.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/projects/${p.projectIdOrName}/cache/tags`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Dangerously Delete Cache By Tags failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelDangerouslyDeleteByTags', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelDeleteRollingReleaseConfig = tool({
    description: 'Tool to delete rolling release configuration for a project. Use when you need to remove or disable rolling release configuration from a Vercel project.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        idOrName: z.string().describe('Project ID or project name (URL-encoded). This identifies the project whose rolling release configuration should be deleted.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/projects/${p.idOrName}/rolling-release`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'DELETE', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Delete Rolling Release Configuration failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelDeleteRollingReleaseConfig', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetBulkAvailability = tool({
    description: 'Tool to check availability for multiple domains at once. Use when you need to verify availability of multiple domain names efficiently in a single request. Supports checking up to 50 domains per request. Only domains with Vercel-supported TLDs can be checked.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        teamId: z.string().optional().describe('Optional team identifier to perform the request on behalf of.'),
        domains: z.array(z.string()).describe('An array of domain names to check for availability. Must contain at least 1 and at most 50 domain names. Each domain should be a valid domain name (e.g., \'example.com\', \'myapp.io\'). IMPORTANT: Onl'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v4/domains/bulk-status`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Get Bulk Domain Availability failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetBulkAvailability', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetConfigurations = tool({
    description: 'Tool to get configurations for the authenticated user or team. Use when you need to list integration configurations installed on an account or team.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of. Only one of teamId or slug may be set.'),
        view: z.string().describe('View type for configurations. Use \'account\' to list all configurations for the account/team, or \'project\' to list configurations for specific projects.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of. Omit for personal account.'),
        installationType: z.string().optional().describe('Filter by installation type. \'marketplace\' for integrations from Vercel marketplace, \'external\' for custom integrations, \'provisioning\' for provisioned integrations.'),
        integrationIdOrSlug: z.string().optional().describe('ID or slug of the integration to filter configurations by.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/integrations/configurations`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Integration Configurations failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetConfigurations', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetContactInfoSchema = tool({
    description: 'Tool to retrieve the contact information schema for a domain\'s top-level domain (TLD). Use when you need to understand what contact information fields are required for a specific domain registration or transfer. Some TLDs require additional contact information beyond standard fields.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('Optional Team slug to perform the request on behalf of'),
        domain: z.string().describe('A valid domain name to retrieve the TLD-specific contact information schema for (e.g., \'example.com\')'),
        teamId: z.string().optional().describe('Optional Team ID to perform the request on behalf of'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v5/domains/contact-info-schema?domain=${p.domain}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Contact Info Schema failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetContactInfoSchema', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetGitNamespaces = tool({
    description: 'Tool to list Git namespaces (organizations/users) by provider. Use this to discover available Git namespaces for integration with projects.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        host: z.string().optional().describe('The custom Git host URL. Required when provider is \'github-custom-host\' for GitHub Enterprise Server. Not needed for other providers.'),
        provider: z.string().optional().describe('Git provider type: github, github-limited, github-custom-host, gitlab, bitbucket'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/git/namespaces`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'List Git Namespaces failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetGitNamespaces', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetRollingRelease = tool({
    description: 'Tool to retrieve active rolling release information for a Vercel project. Use when you need to check the status of a gradual deployment rollout.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        state: z.string().optional().describe('Filter by rolling release state.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        idOrName: z.string().describe('Project ID or project name (URL-encoded).'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/projects/${p.idOrName}/rolling-release`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Rolling Release failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetRollingRelease', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetRollingReleaseBillingStatus = tool({
    description: 'Tool to retrieve the rolling release billing status for a Vercel project. Use when you need to check if rolling releases are available for a project based on the team\'s plan.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        idOrName: z.string().describe('Project ID or project name (URL-encoded).'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/projects/${p.idOrName}/rolling-release/billing`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Rolling Release Billing Status failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetRollingReleaseBillingStatus', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetRollingReleaseConfig = tool({
    description: 'Tool to get rolling release configuration for a Vercel project. Use when you need to retrieve the project-level rolling release settings that define how deployments are gradually rolled out.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        idOrName: z.string().describe('Project ID or project name (URL-encoded)'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/projects/${p.idOrName}/rolling-release/config`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Rolling Release Config failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetRollingReleaseConfig', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetUserEvents = tool({
    description: 'Tool to list user events. Use when you need to retrieve events generated by a user or team, such as logins, deployments, and team activities.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        limit: z.number().optional().describe('Maximum number of items which may be returned.'),
        since: z.string().optional().describe('Timestamp to only include items created since then.'),
        types: z.string().optional().describe('Comma-delimited list of event "types" to filter the results by.'),
        until: z.string().optional().describe('Timestamp to only include items created until then.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        userId: z.string().optional().describe('Deprecated. Use `principalId` instead. If `principalId` and `userId` both exist, `principalId` will be used.'),
        projectIds: z.string().optional().describe('Comma-delimited list of project IDs to filter the results by.'),
        principalId: z.string().optional().describe('When retrieving events for a Team, the `principalId` parameter may be specified to filter events generated by a specific principal.'),
        withPayload: z.string().optional().describe('When set to `true`, the response will include the `payload` field for each event.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/events`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'List User Events failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetUserEvents', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelRecordEvents = tool({
    description: 'Tool to record artifacts cache usage events. Use when tracking cache hits and misses for artifact hashes to monitor remote caching performance.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        events: z.array(z.record(z.any())).describe('Array of cache usage events to record. Each event tracks a cache hit or miss for an artifact.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        xArtifactClientCi: z.string().optional().describe('The continuous integration or delivery environment where this artifact is downloaded.'),
        xArtifactClientInteractive: z.number().optional().describe('1 if the client is an interactive shell, otherwise 0.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v2/artifacts/events`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Record Artifacts Cache Events failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelRecordEvents', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelRequestDeleteUser = tool({
    description: 'Tool to initiate user account deletion on Vercel. Use when a user wants to delete their account. This triggers a verification email to confirm the deletion request.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        reasons: z.array(z.record(z.any())).optional().describe('Optional array of objects that describe the reason why the User account is being deleted.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/user/delete-request`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Request Delete User Account failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelRequestDeleteUser', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelRequestPromote = tool({
    description: 'Tool to promote a deployment to production by pointing all production domains for a project to the given deployment. Use this when you need to make a specific deployment live without rebuilding. The deployment must be in \'STAGED\' state (never served production traffic) and the project must have auto-assignment of custom production domains disabled. For deployments that have already been promoted (seen production traffic), use instant rollback instead.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        projectId: z.string().describe('The unique project identifier. Use VERCEL_LIST_PROJECTS to find available projects.'),
        deploymentId: z.string().describe('The deployment identifier to promote to production. The deployment must be in \'STAGED\' state (readySubstate=\'STAGED\'). Use VERCEL_LIST_ALL_DEPLOYMENTS to find eligible deployments.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/projects/${p.projectId}/promote/${p.deploymentId}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Promote Deployment to Production failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelRequestPromote', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelSearchRepo = tool({
    description: 'Tool to search and list Git repositories linked to a namespace by provider. Use this to discover available repositories for integration with Vercel projects.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        host: z.string().optional().describe('The custom Git host if using a custom Git provider, like GitHub Enterprise Server'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of'),
        query: z.string().optional().describe('Search query to filter repositories by name'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of'),
        provider: z.string().optional().describe('Filter by Git provider type (github, github-limited, github-custom-host, gitlab, or bitbucket)'),
        namespaceId: z.string().optional().describe('The ID of the namespace to search repositories in'),
        installationId: z.string().optional().describe('The ID of the Git integration installation'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/git/repos/search`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Search Git Repositories failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelSearchRepo', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelUpdateStaticIps = tool({
    description: 'Tool to configure Static IPs for a Vercel project. Use when you need to enable or configure Static IPs for builds or specific regions. Requires either \'builds\' or \'regions\' parameter to be provided.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        builds: z.boolean().optional().describe('Whether to use Static IPs for builds. Must provide either \'builds\' or \'regions\' parameter.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        regions: z.array(z.string()).optional().describe('List of regions in which to enable Static IPs. Must provide either \'builds\' or \'regions\' parameter. Minimum 0 items, maximum 3 items. Each region code should be max 4 characters (e.g., \'iad1\').'),
        idOrName: z.string().describe('The unique project identifier or the project name'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/projects/${p.idOrName}/static-ips`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Update Project Static IPs failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelUpdateStaticIps', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelUpdateUrlProtectionBypass = tool({
    description: 'Tool to update the protection bypass for a URL. Use when you need to configure shareable links with TTL, revoke/regenerate links, set user-scoped access permissions, or manage alias protection overrides.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        id: z.string().describe('The alias or deployment ID to update protection bypass for'),
        ttl: z.number().optional().describe('Optional time the shareable link is valid for in seconds. If not provided, the shareable link will never expire. Maximum: 63,072,000 seconds.'),
        slug: z.string().optional().describe('Team slug to perform the request on behalf of'),
        scope: z.record(z.any()).optional().describe('Configuration for user-scoped protection bypass.'),
        revoke: z.record(z.any()).optional().describe('Configuration for revoking/regenerating shareable links.'),
        teamId: z.string().optional().describe('Team identifier to perform the request on behalf of'),
        override: z.record(z.any()).optional().describe('Configuration for alias protection override.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/aliases/${p.id}/protection-bypass`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Update URL Protection Bypass failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelUpdateUrlProtectionBypass', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelUploadFile = tool({
    description: 'Tool to upload deployment files to Vercel. Use when preparing files for a Vercel deployment. The uploaded file is stored and returns CDN URLs for use in deployment creation.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        xNowSize: z.number().optional().describe('The file size as an alternative to Content-Length.'),
        xNowDigest: z.string().optional().describe('Alternative to x-vercel-digest. The file SHA1 used to check integrity.'),
        contentLength: z.number().optional().describe('The file size in bytes. If not provided, it will be calculated automatically.'),
        xVercelDigest: z.string().optional().describe('The file SHA1 hash used to check integrity. If not provided, the SHA1 hash will be automatically computed from the file content.'),
        fileToUpload: z.record(z.any()).describe('File to upload.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v2/files`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Upload Deployment File failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelUploadFile', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelWhoAmI = tool({
    description: 'Return the identity (email, username) of the connected Vercel account.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v2/user`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Who Am I failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelWhoAmI', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});
