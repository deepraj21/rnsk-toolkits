// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoConvertZohoLead = tool({
    description: 'Converts a lead into a contact, account, and optionally a deal in Zoho CRM.',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        lead_id: z.string().describe('The unique ID of the lead to convert.'),
        assign_to: z.string().optional().describe('User ID to assign as the owner of the new contact/account.'),
        overwrite: z.boolean().optional().describe('Whether to overwrite the account name in the contact if it already exists and the company names mismatch.'),
        account_id: z.string().optional().describe('ID of an existing account to associate with the converted lead.'),
        contact_id: z.string().optional().describe('ID of an existing contact to associate with the converted lead.'),
        notify_lead_owner: z.boolean().optional().describe('Notify the lead owner about the conversion via email.'),
        notify_new_entity_owner: z.boolean().optional().describe('Notify the new owner of the contact/account via email.'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/Leads/${p.lead_id}/actions/convert`;
            const body: any = {};
            if (p.assignTo) body.assign_to = p.assignTo;
            if (p.overwrite !== undefined) body.overwrite = p.overwrite;
            if (p.account_id) body.account_id = p.account_id;
            if (p.contact_id) body.contact_id = p.contact_id;
            if (p.notifyLeadOwner !== undefined) body.notify_lead_owner = p.notifyLeadOwner;
            if (p.notifyNewEntityOwner !== undefined) body.notify_new_entity_owner = p.notifyNewEntityOwner;
            const res = await zohoFetch(path, { zohoToken, method: 'POST', body: { data: [body] } });
            if (!res.ok) return { error: 'Failed to convert lead', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoConvertZohoLead', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
