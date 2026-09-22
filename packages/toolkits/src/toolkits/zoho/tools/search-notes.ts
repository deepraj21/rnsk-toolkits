// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoSearchNotes = tool({
    description: 'Search for notes in Zoho CRM using server-side queries. Allows searching notes by criteria (field conditions), keyword, email, or phone number. Use this action when you need to find specific notes based on title, content, creation date, parent record, or other note attributes, rather than listing al',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        page: z.number().int().min(1).optional().describe('Page number to retrieve (default: 1). Maximum 2,000 records are accessible via search API. Maximum page number is floor(2000/per_page).'),
        word: z.string().optional().describe('Global search keyword across multiple note fields including Note_Title and Note_Content. Cannot be used together with criteria, email, or phone parameters.'),
        email: z.string().optional().describe('Search for this email address across all email fields associated with the note\'s parent record. Cannot be used together with criteria, phone, or word parameters.'),
        phone: z.string().optional().describe('Search for this phone number across all phone fields associated with the note\'s parent record. Cannot be used together with criteria, email, or word parameters.'),
        fields: z.string().optional().describe('Comma-separated API names of fields to return in the response. If not specified, all fields are returned. Common note fields: Note_Title, Note_Content, Created_Time, Modified_Time, Owner, Parent_Id, $'),
        criteria: z.string().optional().describe('Advanced search using field conditions. Single condition format: (Field_API_Name:operator:value). Multiple conditions format: ((Field1:operator:value)and/or(Field2:operator:value)). Supported operator'),
        per_page: z.number().int().min(1).max(200).optional().describe('Number of records per page. Maximum is 200.'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/Notes/search`;
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
            return { error: 'Error in ZohoSearchNotes', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
