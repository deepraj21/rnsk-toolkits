// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoDeleteContact = tool({
    description: 'Deletes a contact from Zoho CRM. This action is irreversible — the contact cannot be recovered once deleted. Use this action when you need to permanently remove a contact record from the CRM. All associated subforms and related data are automatically deleted.',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        contact_id: z.string().describe('The unique identifier of the contact to delete'),
        wf_trigger: z.boolean().optional().describe('Whether to trigger workflows during deletion. If true, all associated workflows execute. Defaults to true if not specified.'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/Contacts/${p.contact_id}`;
            const res = await zohoFetch(path, { zohoToken, method: 'DELETE' });
            if (!res.ok) return { error: 'Failed to delete', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoDeleteContact', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
