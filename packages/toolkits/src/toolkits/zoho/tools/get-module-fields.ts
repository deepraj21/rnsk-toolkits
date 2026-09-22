// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoGetModuleFields = tool({
    description: 'Retrieves field metadata for a Zoho CRM module including API names, data types, permissions, and configuration details. Use this tool to discover correct field names and types before creating or updating records, avoiding INVALID_DATA errors. Returns information about standard fields, custom fields,',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        type: z.string().optional().describe('Filter fields by usage type. Values: \'all\' (both used and unused fields) or \'unused\' (unused fields only). If not specified, returns all used fields.'),
        include: z.string().optional().describe('Include additional permission details in the response. Use \'allowed_permissions_to_update\' to get default field permissions (read-only, read-write, hidden).'),
        field_unique_id: z.string().optional().describe('The unique ID of a specific field to retrieve. When provided, only that single field\'s metadata is returned. If not specified, all fields for the module are returned.'),
        module_api_name: z.string().describe('The API name of the module to retrieve field metadata for. Examples: \'Leads\', \'Contacts\', \'Accounts\', \'Deals\', \'Tasks\', \'Cases\', \'Events\', \'Calls\', etc. For custom modules, use the exa'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/settings/fields`;
            const query: any = {};
            if (p.fields) query.fields = p.fields;
            if (p.module_api_name) query.module = p.module_api_name;
            const res = await zohoFetch(path, { zohoToken, method: 'GET', query });
            if (!res.ok) return { error: 'Failed to get', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoGetModuleFields', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
