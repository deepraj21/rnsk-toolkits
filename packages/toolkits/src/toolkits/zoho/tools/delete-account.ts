// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoDeleteAccount = tool({
    description: 'Deletes an existing account record from Zoho CRM. This action permanently removes the account and cannot be undone through the API. Use this action when you need to remove an account record that is no longer needed or was created in error. This action is irreversible — the account cannot be recovere',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        account_id: z.string().describe('The unique identifier of the account to delete. Must be a valid Zoho CRM account ID.'),
        wf_trigger: z.boolean().optional().describe('Whether to trigger workflow rules during deletion. Set to true to execute workflows, false to skip them. If not specified, default behavior applies.'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/Accounts/${p.account_id}`;
            const res = await zohoFetch(path, { zohoToken, method: 'DELETE' });
            if (!res.ok) return { error: 'Failed to delete', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoDeleteAccount', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
