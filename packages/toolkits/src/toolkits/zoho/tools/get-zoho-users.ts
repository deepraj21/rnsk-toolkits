// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoGetZohoUsers = tool({
    description: 'Tool to retrieve users from Zoho CRM. Use when you need to fetch user information such as IDs, names, emails, roles, or status for setting Owner fields or performing user-related operations in CRM workflows.',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        ids: z.string().optional().describe('Comma-separated list of user IDs to retrieve specific users. Maximum of 100 user IDs can be specified at once.'),
        page: z.number().int().min(1).optional().describe('Page number to retrieve for paginated results. Default is 1.'),
        type: z.string().optional().describe('The type of users to retrieve. Supported values: \'AllUsers\' (all users including inactive), \'ActiveUsers\' (only active users), \'DeactiveUsers\' (only deactivated users), \'ConfirmedUsers\' (users'),
        per_page: z.number().int().min(1).max(200).optional().describe('Number of users to retrieve per page. Maximum is 200. Default is 200.'),
        if_modified_since: z.string().optional().describe('Retrieve users modified after this timestamp. Use ISO 8601 format (e.g., \'2024-01-15T10:00:00+00:00\'). This will be sent as the \'If-Modified-Since\' header to the API.'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/users`;
            const res = await zohoFetch(path, { zohoToken, method: 'GET', query: p });
            if (!res.ok) return { error: 'Failed', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoGetZohoUsers', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
