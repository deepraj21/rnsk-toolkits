// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoGetUser = tool({
    description: 'Retrieves a specific user from Zoho CRM by their user ID. Returns detailed user information including name, email, role, profile, status, and preferences. Use this action when you need to fetch information about a specific user by ID, or use \'me\' as the user_id to get the currently authenticated u',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        user_id: z.string().describe('The unique identifier of the user to retrieve. This can be the user\'s ID from the Zoho CRM system or the special value \'me\' to retrieve the currently authenticated user\'s information.'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/users/${p.user_id}`;
            const query: any = {};
            if (p.fields) query.fields = p.fields;
            if (p.module_api_name) query.module = p.module_api_name;
            const res = await zohoFetch(path, { zohoToken, method: 'GET', query });
            if (!res.ok) return { error: 'Failed to get', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoGetUser', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
