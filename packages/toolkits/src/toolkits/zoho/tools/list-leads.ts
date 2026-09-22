// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoListLeads = tool({
    description: 'Retrieves lead records from Zoho CRM\'s Leads module with pagination support. Use this action when you need to list, filter, or paginate through leads in the CRM. Supports both discrete pagination (up to 2,000 leads) and token-based pagination for larger datasets.',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        ids: z.string().optional().describe('Comma-separated lead record IDs to fetch specific leads. Note: This parameter is ignored when page_token is provided.'),
        cvid: z.number().int().optional().describe('Custom view ID to filter the leads. Cannot be used together with sort_by. Note: This parameter is ignored when page_token is provided.'),
        page: z.number().int().min(1).optional().describe('Page number to retrieve. Without page_token, only the first 2,000 leads are accessible using page/per_page. Maximum page number is floor(2000/per_page). Do not use together with page_token.'),
        fields: z.string().min(1).optional().describe('Comma-separated API names of the fields to retrieve (max 50). At least one field must be specified (empty string not allowed). Common Lead fields: First_Name, Last_Name, Full_Name, Email, Phone, Mobil'),
        sort_by: z.string().optional().describe('Valid fields for sorting Zoho CRM leads.'),
        per_page: z.number().int().min(1).max(200).optional().describe('Number of leads per page. Maximum is 200. Applies to both page and page_token pagination.'),
        converted: z.string().optional().describe('Filter leads by conversion status.'),
        page_token: z.string().optional().describe('Token-based pagination parameter to fetch leads beyond the 2,000-record discrete limit. Use the info.next_page_token from the previous response. Cannot be used together with page.'),
        sort_order: z.string().optional().describe('Sort order for leads.'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/Leads`;
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
            return { error: 'Error in ZohoListLeads', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
