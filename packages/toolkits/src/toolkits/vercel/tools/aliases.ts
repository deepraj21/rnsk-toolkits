// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { vercelFetch } from './client.js';

export const vercelAssignAlias = tool({
    description: 'Tool to assign an alias to a specific Vercel deployment. Use when you need to associate a custom domain or subdomain with a deployment.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        id: z.string().describe('The ID of the deployment to assign the alias to'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of'),
        alias: z.string().describe('The alias we want to assign to the deployment'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of'),
        redirect: z.string().optional().describe('The redirect property will take precedence over the deployment id from the URL and consists of a hostname (like test.com) to which the alias should redirect using status code 307'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v2/deployments/${p.id}/aliases`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Assign Alias to Deployment failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelAssignAlias', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelDeleteAlias = tool({
    description: 'Tool to delete an alias from Vercel. Use when you need to remove a deployment alias or custom domain alias after confirming the alias ID.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        aliasId: z.string().describe('The ID or alias that will be removed. This is the unique identifier of the alias to delete.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v2/aliases/${p.aliasId}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'DELETE', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Delete Vercel Alias failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelDeleteAlias', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetAlias = tool({
    description: 'Tool to retrieve information about a Vercel alias by ID or alias name. Use when you need to get details of a specific alias.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        from: z.number().optional().describe('Get the alias only if it was created after the provided timestamp (milliseconds).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        since: z.number().optional().describe('Get the alias only if it was created after this JavaScript timestamp (milliseconds).'),
        until: z.number().optional().describe('Get the alias only if it was created before this JavaScript timestamp (milliseconds).'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        idOrAlias: z.string().describe('The alias or alias ID to be retrieved.'),
        projectId: z.string().optional().describe('Get the alias only if it is assigned to the provided project ID.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v2/aliases/${p.idOrAlias}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Vercel Alias failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetAlias', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetPromoteAliases = tool({
    description: 'Tool to get a list of aliases with status for the current promote operation. Use when you need to check the status of aliases during a promotion process for a specific project.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        limit: z.number().optional().describe('Maximum number of aliases to list from a request (max 100).'),
        since: z.number().optional().describe('Get aliases created after this epoch timestamp in milliseconds.'),
        until: z.number().optional().describe('Get aliases created before this epoch timestamp in milliseconds.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        projectId: z.string().describe('The unique identifier of the project.'),
        failedOnly: z.boolean().optional().describe('Filter results down to aliases that failed to map to the requested deployment.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/projects/${p.projectId}/promote/aliases`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'List Promote Aliases failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetPromoteAliases', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelListAliases = tool({
    description: 'Tool to list aliases from Vercel API. Use when you need to retrieve aliases with optional filtering by domain, project, or time range. Results are paginated; use `limit` with `since`/`until` to iterate pages. Without filters, results span all projects and the personal account scope.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        from: z.number().optional().describe('Get only aliases created after the provided timestamp (milliseconds).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        limit: z.number().optional().describe('Maximum number of aliases to list from a request.'),
        since: z.number().optional().describe('Get aliases created after this JavaScript timestamp (milliseconds).'),
        until: z.number().optional().describe('Get aliases created before this JavaScript timestamp (milliseconds).'),
        domain: z.string().optional().describe('Get only aliases of the given domain name.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        projectId: z.string().optional().describe('Filter aliases from the given projectId.'),
        rollbackDeploymentId: z.string().optional().describe('Get aliases that would be rolled back for the given deployment.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v2/aliases`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'List Vercel Aliases failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelListAliases', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});
