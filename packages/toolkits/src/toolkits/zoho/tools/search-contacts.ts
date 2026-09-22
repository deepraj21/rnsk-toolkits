// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoSearchContacts = tool({
    description: 'Search for contacts in Zoho CRM using server-side queries by criteria, email, phone, or keyword. This action performs efficient server-side filtering in the Contacts module, avoiding pagination limits. Use this action when you need to find specific contacts instead of listing all contacts.',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        page: z.number().int().min(1).optional().describe('Page number to retrieve (default: 1). Maximum 2,000 records are accessible via search API. Maximum page number is floor(2000/per_page).'),
        word: z.string().optional().describe('Global search keyword across multiple fields in Contacts module. Searches across name, email, phone, and other text fields. Cannot be used together with criteria, email, or phone parameters.'),
        email: z.string().optional().describe('Search for this email address across all email fields in Contacts. Cannot be used together with criteria, phone, or word parameters.'),
        phone: z.string().optional().describe('Search for this phone number across all phone fields in Contacts. Cannot be used together with criteria, email, or word parameters.'),
        fields: z.string().optional().describe('Comma-separated API names of fields to return in the response. If not specified, all fields are returned. Common Contact fields: First_Name, Last_Name, Email, Phone, Mobile, Account_Name, Mailing_Stre'),
        criteria: z.string().optional().describe('Search using field conditions. Format: (Field:operator:value) or ((Field1:op:val)and/or(Field2:op:val)). Operators: equals, starts_with, in, not_equal, greater_equal, greater_than, less_equal, less_th'),
        per_page: z.number().int().min(1).max(200).optional().describe('Number of records per page. Default is 25, maximum is 200.'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/Contacts/search`;
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
            return { error: 'Error in ZohoSearchContacts', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
