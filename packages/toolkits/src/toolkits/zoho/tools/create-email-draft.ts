// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoCreateEmailDraft = tool({
    description: 'Creates email drafts for a specific record in Zoho CRM. Email drafts are saved but not sent, allowing for review and editing before sending. Use this action when you need to prepare email communications associated with CRM records (Leads, Contacts, Deals, etc.) that will be reviewed and sent later. ',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        record_id: z.string().describe('Unique identifier of the record for which to create the email draft'),
        __email_drafts: z.array(z.record(z.any())).describe('List of email drafts to create (maximum 100 drafts per API call). Each draft must include \'from\' and \'rich_text\' fields. Use this action when you need to create draft emails associated with a CRM '),
        module_api_name: z.string().describe('The API name of the module containing the record for which to create the email draft. Standard modules include \'Leads\', \'Contacts\', \'Accounts\', \'Deals\', \'Quotes\', \'Sales_Orders\', \'Purchas'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/${p.module_api_name}/${p.record_id}/__email_drafts`;
            const res = await zohoFetch(path, { zohoToken, method: 'POST', body: p });
            if (!res.ok) return { error: 'Failed', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoCreateEmailDraft', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
