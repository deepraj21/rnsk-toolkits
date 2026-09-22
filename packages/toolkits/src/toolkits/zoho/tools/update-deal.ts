// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoUpdateDeal = tool({
    description: 'Updates an existing deal in Zoho CRM. Use this action when you need to modify specific fields of a deal record, such as updating the deal amount, stage, closing date, or associated account. Only the fields included in the data parameter will be modified; other fields remain unchanged. Use when you h',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        data: z.record(z.any()).describe('Object containing the deal fields to update. Use field API names as keys (not display names). Common fields include: \'Deal_Name\', \'Amount\', \'Stage\', \'Closing_Date\', \'Account_Name\' (as lookup'),
        deal_id: z.string().describe('The unique identifier of the deal to update. This is the Zoho CRM record ID.'),
        trigger: z.array(z.string()).optional().describe('List of automation triggers to execute during update. Valid values: [\'workflow\', \'approval\', \'blueprint\', \'pathfinder\', \'orchestration\']. Pass empty array [] to skip all automation. If not s'),
        skip_feature_execution: z.array(z.record(z.any())).optional().describe('Features to skip during the update. Example: [{\'name\': \'cadences\'}] to skip cadence execution'),
        apply_feature_execution: z.array(z.record(z.any())).optional().describe('Features to execute during the update. Example: [{\'name\': \'layout_rules\'}] or [{\'name\': \'criteria_validation_rule\'}]'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/Deals`;
            // For bulk updates, Zoho expects {data: [...]}
            const body = p.data ? { data: p.data, trigger: p.trigger } : { data: [p] };
            const res = await zohoFetch(path, { zohoToken, method: 'PUT', body });
            if (!res.ok) return { error: 'Failed to update', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoUpdateDeal', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
