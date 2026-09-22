// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoUpdateZohoRecord = tool({
    description: 'Updates existing records in a specified module in Zoho CRM. Supports updating up to 100 records per API call. Use field API names (not display names) for all field updates. The \'id\' field is mandatory for each record.',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        data: z.array(z.record(z.any())).describe('A list of dictionaries representing the records to be updated. Each record MUST include the \'id\' field with the record ID to update. Update up to 100 records per API call. Use field API names as key'),
        lar_id: z.string().optional().describe('Assignment rule ID to trigger during record update (for applicable modules like Leads). Use the Get Assignment Rules API to obtain the lar_id.'),
        trigger: z.array(z.string()).optional().describe('List of automation triggers to execute during update. Valid values: [\'workflow\', \'approval\', \'blueprint\', \'pathfinder\', \'orchestration\']. Pass empty array [] to skip all automation. If not s'),
        module_api_name: z.string().describe('The API name of the module to update records in. Standard modules use PascalCase (e.g., \'Leads\', \'Contacts\', \'Accounts\', \'Deals\', \'Tasks\', \'Campaigns\'). Custom modules must use their exact'),
        skip_feature_execution: z.array(z.record(z.any())).optional().describe('Features to skip during the update. Example: [{\'name\': \'cadences\'}] to skip cadence execution'),
        apply_feature_execution: z.array(z.record(z.any())).optional().describe('Features to execute during the update. Example: [{\'name\': \'layout_rules\'}] or [{\'name\': \'criteria_validation_rule\'}]'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const { moduleApiName, data, trigger, larId } = rest as any;
            const body: any = { data };
            if (trigger) body.trigger = trigger;
            const res = await zohoFetch(`/${moduleApiName}`, { zohoToken, method: 'PUT', body });
            if (!res.ok) return { error: 'Failed to update record', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoUpdateZohoRecord', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
