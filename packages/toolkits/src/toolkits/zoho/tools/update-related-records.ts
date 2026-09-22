// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoUpdateRelatedRecords = tool({
    description: 'Associates or updates relationships between records across different modules in Zoho CRM. This action creates or modifies relationships between a parent record and related records. Common use cases: - Associate Leads/Contacts with Campaigns (with member status) - Link Products to Deals/Quotes/Accoun',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        data: z.array(z.record(z.any())).describe('A list of related records to associate with the parent record. Each dictionary must include: 1) \'id\' (string, mandatory): The unique ID of the related record to associate. 2) Optional fields to upda'),
        record_id: z.string().describe('The unique identifier (ID) of the parent record to which related records will be associated. This is the numeric ID from Zoho CRM (e.g., \'5725767000000649013\').'),
        module_api_name: z.string().describe('The API name of the parent module where the record resides. Common modules: \'Leads\', \'Contacts\', \'Accounts\', \'Deals\', \'Products\', \'Quotes\'. Use the exact module API name (PascalCase, e.g.,'),
        related_list_api_name: z.string().describe('The API name of the related list/module to update relationships with. Common examples: \'Campaigns\' (for Lead-Campaign relations), \'Products\' (for Deal-Product relations), \'Contacts\' (for Account'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/${p.module_api_name}/${p.record_id}/${p.related_list_api_name}`;
            // For bulk updates, Zoho expects {data: [...]}
            const body = p.data ? { data: p.data, trigger: p.trigger } : { data: [p] };
            const res = await zohoFetch(path, { zohoToken, method: 'PUT', body });
            if (!res.ok) return { error: 'Failed to update', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoUpdateRelatedRecords', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
