// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoGetRelatedLists = tool({
    description: 'Retrieves related list metadata for a Zoho CRM module to discover correct api_name values. Use this before updating related records to avoid INVALID_DATA errors from incorrect related_list_api_name. Returns api_name, display_label, href, and other details for each related list available in the modul',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        layout_id: z.string().optional().describe('Optional layout ID to filter related lists by specific layout. If not specified, returns related lists for all layouts of the module.'),
        module_api_name: z.string().describe('The API name of the module to retrieve related list metadata for. Examples: \'Leads\', \'Contacts\', \'Accounts\', \'Deals\', \'Tasks\', etc. This must be a valid module API name in Zoho CRM.'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/settings/related_lists`;
            const res = await zohoFetch(path, { zohoToken, method: 'GET', query: p });
            if (!res.ok) return { error: 'Failed', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoGetRelatedLists', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
