// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoDeleteDeal = tool({
    description: 'Deletes a deal record from Zoho CRM. This action is irreversible — once deleted, the deal cannot be recovered. Use this action when you need to permanently remove a deal from the CRM system. The deal will be moved to the recycle bin initially and can be restored from there within the configured rete',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        deal_id: z.string().describe('The unique identifier of the deal to delete. This is the Zoho CRM record ID for the deal'),
        wf_trigger: z.boolean().optional().describe('Whether to trigger workflow rules after deletion. Set to true to execute workflows, or false to skip them. When workflows execute, side effects like notifications and automations may occur'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/Deals/${p.deal_id}`;
            const res = await zohoFetch(path, { zohoToken, method: 'DELETE' });
            if (!res.ok) return { error: 'Failed to delete', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoDeleteDeal', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
