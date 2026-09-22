// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoSearchZohoRecords = tool({
    description: 'Search for records within a Zoho CRM module using server-side queries. Use when you need to find specific records by criteria, email, phone, or keyword instead of listing all records. This avoids pagination limits and performs efficient server-side filtering.',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        page: z.number().int().min(1).optional().describe('Page number to retrieve (default: 1). Maximum 2,000 records are accessible via search API. Maximum page number is floor(2000/per_page).'),
        word: z.string().optional().describe('Global search keyword across multiple fields in the module. Cannot be used together with criteria, email, or phone parameters.'),
        email: z.string().optional().describe('Search for this email address across all email fields in the module. Cannot be used together with criteria, phone, or word parameters.'),
        phone: z.string().optional().describe('Search for this phone number across all phone fields in the module. Cannot be used together with criteria, email, or word parameters.'),
        fields: z.string().optional().describe('Comma-separated API names of fields to return in the response. If not specified, all fields are returned. Example: \'First_Name,Last_Name,Email,Phone\'.'),
        criteria: z.string().optional().describe('Advanced search using field conditions. Single condition format: (Field_API_Name:operator:value). Multiple conditions format: ((Field1:operator:value)and/or(Field2:operator:value)). Supported operator'),
        per_page: z.number().int().min(1).max(200).optional().describe('Number of records per page. Default and maximum is 200.'),
        module_api_name: z.string().describe('The API name of the module to search in. Standard modules use PascalCase (e.g., \'Leads\', \'Contacts\', \'Accounts\', \'Deals\'). Custom modules must use their exact API name as configured in Zoho CR'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/${p.module_api_name}/search`;
            const query: any = {};
            if (p.criteria) query.criteria = p.criteria;
            if (p.email) query.email = p.email;
            if (p.phone) query.phone = p.phone;
            if (p.word) query.word = p.word;
            if (p.fields) query.fields = p.fields;
            if (p.page) query.page = p.page;
            if (p.per_page) query.per_page = p.per_page;
            const res = await zohoFetch(path, { zohoToken, method: 'GET', query });
            if (!res.ok) return { error: 'Failed to search', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoSearchZohoRecords', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
