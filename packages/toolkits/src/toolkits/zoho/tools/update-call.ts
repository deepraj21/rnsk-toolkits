// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoUpdateCall = tool({
    description: 'Updates existing call records in the Calls module in Zoho CRM. Supports updating up to 100 call records per API call. Use this action when you need to modify call details such as call duration, call type, subject, or related contacts/leads. Use field API names (not display names) for all field updat',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        data: z.array(z.record(z.any())).describe('A list of dictionaries representing the call records to be updated. Each record MUST include the \'id\' field with the call record ID to update. Update up to 100 records per API call. Use field API na'),
        trigger: z.array(z.string()).optional().describe('List of automation triggers to execute during update. Valid values: [\'workflow\', \'approval\', \'blueprint\', \'pathfinder\', \'orchestration\']. Pass empty array [] to skip all automation. If not s'),
        skip_feature_execution: z.array(z.record(z.any())).optional().describe('Features to skip during the update. Example: [{\'name\': \'cadences\'}] to skip cadence execution'),
        apply_feature_execution: z.array(z.record(z.any())).optional().describe('Features to execute during the update. Example: [{\'name\': \'layout_rules\'}] or [{\'name\': \'criteria_validation_rule\'}]'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/Calls`;
            // For bulk updates, Zoho expects {data: [...]}
            const body = p.data ? { data: p.data, trigger: p.trigger } : { data: [p] };
            const res = await zohoFetch(path, { zohoToken, method: 'PUT', body });
            if (!res.ok) return { error: 'Failed to update', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoUpdateCall', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
