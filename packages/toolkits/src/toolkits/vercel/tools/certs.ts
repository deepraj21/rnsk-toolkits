// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { vercelFetch } from './client.js';

export const vercelGetCerts = tool({
    description: 'Tool to retrieve SSL/TLS certificates for the authenticated user or team. Use after authentication to list active certificates.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('Team slug to perform the request on behalf of'),
        limit: z.number().optional().describe('Maximum number of certificates to return (max 100)'),
        since: z.number().optional().describe('Timestamp in milliseconds; include certificates created since this time'),
        until: z.number().optional().describe('Timestamp in milliseconds; include certificates created until this time'),
        teamId: z.string().optional().describe('Team identifier to perform the request on behalf of. Omit for personal account.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v3/certs`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get SSL/TLS Certificates failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetCerts', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});
