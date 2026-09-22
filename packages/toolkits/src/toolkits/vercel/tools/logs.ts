// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { vercelFetch } from './client.js';

export const vercelGetAllLogDrains = tool({
    description: 'Tool to retrieve a list of all log drains (deprecated). Use when you need to list all log drains configured for your account, team, or project.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of'),
        projectId: z.string().optional().describe('Filter log drains by project ID'),
        includeMetadata: z.boolean().optional().describe('Include metadata in the response'),
        projectIdOrName: z.string().optional().describe('Filter log drains by project ID or name'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v2/drains`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get All Log Drains failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetAllLogDrains', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetDrains = tool({
    description: 'Tool to retrieve a list of all drains. Use this to get all configured drains for an account or team, including their delivery configurations and sources.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of'),
        projectId: z.string().optional().describe('Filter drains by project ID'),
        includeMetadata: z.boolean().optional().describe('Whether to include additional metadata in the response'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/drains`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get All Drains failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetDrains', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetRuntimeLogs = tool({
    description: 'DEPRECATED: Use VERCEL_GET_DEPLOYMENT_LOGS2 instead. Tool to retrieve runtime logs for a specific Vercel deployment. Use when monitoring deployment execution, debugging runtime issues, or analyzing deployment performance. Runtime logs show application behavior during execution, including errors and request information.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of'),
        projectId: z.string().describe('The unique identifier of the project'),
        deploymentId: z.string().describe('The unique identifier of the deployment'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/projects/${p.projectId}/deployments/${p.deploymentId}/logs`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Runtime Logs (Deprecated) failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetRuntimeLogs', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelListIntegrationLogDrains = tool({
    description: 'Retrieves a list of Integration log drains for a team or account. Log drains forward logs from deployments to external endpoints. When using an OAuth2 token, results are limited to log drains created by the authenticated integration.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/integrations/log-drains`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Integration Log Drains failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelListIntegrationLogDrains', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelTestDrain = tool({
    description: 'Tool to validate a drain delivery configuration by sending a test request. Use when you need to verify that a drain endpoint is properly configured and can receive events before creating the actual drain.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of'),
        schemas: z.record(z.any()).describe('Schema definitions for the drain events. Can be an empty object {} if no specific schemas are required'),
        delivery: z.record(z.any()).describe('Delivery configuration specifying where and how to send drain events'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/drains/test`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Test Drain Configuration failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelTestDrain', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});
