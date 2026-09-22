// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoUpdateLead = tool({
    description: 'Updates existing lead records in Zoho CRM. Supports updating up to 100 leads per API call. Use this action when you need to modify lead information such as contact details, lead status, lead source, or other lead-specific fields. Use field API names (not display names) for all field updates. The \'i',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        data: z.array(z.record(z.any())).describe('A list of lead records to be updated. Each lead MUST include the \'id\' field with the lead record ID to update. Update up to 100 leads per API call. Use field API names as keys (not display names). C'),
        lar_id: z.string().optional().describe('Assignment rule ID to trigger during lead update. Use the Get Assignment Rules API to obtain the lar_id.'),
        trigger: z.array(z.string()).optional().describe('List of automation triggers to execute during update. Valid values: [\'workflow\', \'approval\', \'blueprint\', \'pathfinder\', \'orchestration\']. Pass empty array [] to skip all automation. If not s'),
        skip_feature_execution: z.array(z.record(z.any())).optional().describe('Features to skip during the update. Example: [{\'name\': \'cadences\'}] to skip cadence execution'),
        apply_feature_execution: z.array(z.record(z.any())).optional().describe('Features to execute during the update. Example: [{\'name\': \'layout_rules\'}] or [{\'name\': \'criteria_validation_rule\'}]'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/Leads`;
            // For bulk updates, Zoho expects {data: [...]}
            const body = p.data ? { data: p.data, trigger: p.trigger } : { data: [p] };
            const res = await zohoFetch(path, { zohoToken, method: 'PUT', body });
            if (!res.ok) return { error: 'Failed to update', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoUpdateLead', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
