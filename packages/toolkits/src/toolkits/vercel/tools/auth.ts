// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { vercelFetch } from './client.js';

export const vercelCreateAuthToken = tool({
    description: 'Tool to create a new authentication token. Use when you need to programmatically generate a new auth token with optional expiration. Returns both token metadata and the bearer token value (only provided once).',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        name: z.string().describe('The human-readable name of the token.'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        expiresAt: z.number().optional().describe('Timestamp (in milliseconds) of when the token expires. Must be within 2 years from now. If not provided, the token will not expire.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v3/user/tokens`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Create Auth Token failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelCreateAuthToken', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelDeleteAuthToken = tool({
    description: 'Tool to delete an authentication token. Use when you need to revoke a token programmatically after confirming its validity. Example: "Delete auth token with id abc123"',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        tokenId: z.string().describe('The identifier of the token to invalidate. Use \'current\' to invalidate the token used for this request.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v3/user/tokens/${p.tokenId}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'DELETE', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Delete Auth Token failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelDeleteAuthToken', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetAuthToken = tool({
    description: 'Tool to retrieve metadata for an authentication token. Use when you need to inspect details of a specific token or get information about the current token being used.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        tokenId: z.string().describe('The identifier of the token to retrieve. The special value \'current\' may be supplied, which returns the metadata for the token that the current HTTP request is authenticated with.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v5/user/tokens/${p.tokenId}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Auth Token Metadata failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetAuthToken', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetAuthUser = tool({
    description: 'Tool to get the authenticated user\'s profile. Use when you need to retrieve details about the currently authenticated user.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v2/user`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Authenticated User failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetAuthUser', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelListAuthTokens = tool({
    description: 'Tool to list authentication tokens. Use when you need to retrieve all tokens for the current user or an optional team.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        teamId: z.string().optional().describe('Team ID to list tokens for. If omitted, lists tokens for the current user.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v3/user/tokens`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'List Auth Tokens failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelListAuthTokens', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});
