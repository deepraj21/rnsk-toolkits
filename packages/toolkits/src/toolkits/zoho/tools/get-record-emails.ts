// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoGetRecordEmails = tool({
    description: 'Retrieves all emails associated with a specific record in Zoho CRM. Use this action when you need to fetch email history for a lead, contact, account, deal, or other CRM record. The response includes email metadata such as subject, sender, recipients, timestamps, and status information. Supports pag',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        type: z.string().optional().describe('Type of emails to filter.'),
        index: z.string().optional().describe('Pagination control parameter. Use the \'next_index\' value from the previous response\'s info object to retrieve the next batch of emails. Start without this parameter to get the first page.'),
        owner_id: z.string().optional().describe('The ID of the user whose emails you want to fetch. IMPORTANT: This parameter can only be used when type=\'user_emails\'. It will be ignored if type is set to any other value.'),
        record_id: z.string().describe('The unique identifier of the record whose emails you want to retrieve.'),
        module_api_name: z.string().describe('The API name of the module containing the record. Common modules: \'Leads\', \'Contacts\', \'Accounts\', \'Deals\', \'Quotes\', \'Invoices\', \'Sales_Orders\', \'Purchase_Orders\', or custom modules. '),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/${p.module_api_name}/${p.record_id}/Emails`;
            const query: any = {};
            if (p.fields) query.fields = p.fields;
            if (p.module_api_name) query.module = p.module_api_name;
            const res = await zohoFetch(path, { zohoToken, method: 'GET', query });
            if (!res.ok) return { error: 'Failed to get', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoGetRecordEmails', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
