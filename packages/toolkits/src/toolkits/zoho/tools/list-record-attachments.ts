// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoListRecordAttachments = tool({
    description: 'Tool to list attachment metadata (id, File_Name, Size, Created_Time, etc.) for a specific Zoho CRM record. Use when you need to identify attachments before downloading them via other means. This returns metadata only, not the actual file content.',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        page: z.number().int().min(1).optional().describe('Page number to retrieve (default: 1).'),
        fields: z.string().optional().describe('Comma-separated API names of attachment fields to retrieve. Common fields: id, File_Name, Size, Created_Time, Modified_Time, Owner, Parent_Id, Created_By, Modified_By, $editable, $file_id, $se_module.'),
        per_page: z.number().int().min(1).max(200).optional().describe('Number of attachments per page (default and maximum: 200).'),
        record_id: z.string().describe('The unique ID of the record to list attachments for.'),
        module_api_name: z.string().describe('The API name of the module containing the record. Examples: \'Leads\', \'Contacts\', \'Accounts\', \'Deals\', etc.'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/${p.module_api_name}/${p.record_id}/Attachments`;
            const query: any = {};
            if (p.fields) query.fields = p.fields;
            if (p.page) query.page = p.page;
            if (p.per_page) query.per_page = p.per_page;
            if (p.per_page) query.per_page = p.per_page;
            if (p.sort_by) query.sort_by = p.sort_by;
            if (p.sort_order) query.sort_order = p.sort_order;
            if (p.cvid) query.cvid = p.cvid;
            if (p.page_token) query.page_token = p.page_token;
            if (p.approved) query.approved = p.approved;
            if (p.territoryId) query.territory_id = p.territoryId;
            if (p.includeChild !== undefined) query.include_child = p.includeChild;
            const res = await zohoFetch(path, { zohoToken, method: 'GET', query });
            if (!res.ok) return { error: 'Failed to list', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoListRecordAttachments', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
