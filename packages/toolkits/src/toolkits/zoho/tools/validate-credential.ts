// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoValidateCredential = tool({
    description: 'Validates Zoho CRM credentials by retrieving current user information. Returns user details if credentials are valid. Use this action when you need to verify that API credentials are working correctly before performing other operations. This is a read-only operation that confirms authentication with',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/users?type=CurrentUser`;
            const res = await zohoFetch(path, { zohoToken, method: 'GET', query: p });
            if (!res.ok) return { error: 'Failed', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoValidateCredential', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
