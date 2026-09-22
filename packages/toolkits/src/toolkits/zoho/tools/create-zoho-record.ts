// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoCreateZohoRecord = tool({
    description: 'Creates new records in a specified module in Zoho CRM. Bulk operations may partially succeed — inspect each item\'s status field in the response, as some records may be created while others fail.',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        data: z.array(z.record(z.any())).describe('A list of dictionaries representing the records to be created. Each dictionary contains field API names as keys and their values. Required fields depend on the module (e.g., Last_Name is required for '),
        lar_id: z.string().optional().describe('The layout ID or lead assignment rule ID (lar_id) to be used if required.'),
        trigger: z.array(z.string()).optional().describe('List of triggers to invoke during record creation (e.g., [\'workflow\', \'blueprint\']). Enabling triggers can cause side effects (emails sent, other records modified) — only include when such effects'),
        module_api_name: z.string().describe('The API name of the module to create a record in. Standard modules use PascalCase (e.g., \'Leads\', \'Contacts\', \'Accounts\', \'Deals\', \'Tasks\', \'Campaigns\'). Custom modules must use their exac'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const { moduleApiName, data, trigger, larId } = rest as any;
            const body: any = { data };
            if (trigger) body.trigger = trigger;
            if (larId) body.lar_id = larId;
            const res = await zohoFetch(`/${moduleApiName}`, { zohoToken, method: 'POST', body });
            if (!res.ok) return { error: 'Failed to create record', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoCreateZohoRecord', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
