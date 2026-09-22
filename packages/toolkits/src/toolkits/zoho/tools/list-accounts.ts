// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoListAccounts = tool({
    description: 'Retrieves a list of account records from Zoho CRM with pagination and filtering support. Use this action when you need to fetch multiple account records from the Accounts module, optionally filtered by territory, approval status, or custom views. Supports both discrete pagination (first 2,000 record',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        cvid: z.number().int().optional().describe('Custom view ID to filter the account records. Cannot be used together with sort_by. Note: This parameter is ignored when page_token is provided.'),
        page: z.number().int().min(1).optional().describe('Page number to retrieve. Without page_token, only the first 2,000 records are accessible using page/per_page. Maximum page number is floor(2000/per_page). Do not use together with page_token.'),
        fields: z.string().describe('Comma-separated API names of the account fields to retrieve (max 50). This parameter is mandatory in Zoho CRM v8 API. Common fields: Account_Name, Phone, Website, Industry, Annual_Revenue, Owner, Rati'),
        sort_by: z.string().optional().describe('Valid fields for sorting Zoho CRM Accounts records.'),
        approved: z.string().optional().describe('Filter accounts by approval status: \'true\' for approved, \'false\' for not approved, \'both\' for all.'),
        per_page: z.number().int().min(1).max(200).optional().describe('Number of account records per page (max is 200). Default is 25 to avoid token bloat.'),
        page_token: z.string().optional().describe('Token-based pagination parameter to fetch account records beyond the 2,000-record discrete limit. Use the info.next_page_token from the previous response. Cannot be used together with page.'),
        sort_order: z.string().optional().describe('Sort order for Accounts records.'),
        territory_id: z.string().optional().describe('Territory ID to filter accounts by territory assignment.'),
        include_child: z.boolean().optional().describe('Whether to include accounts from child territories when territory_id is specified.'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/Accounts`;
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
            return { error: 'Error in ZohoListAccounts', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
