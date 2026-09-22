// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoGetNote = tool({
    description: 'Retrieves a single note by its unique identifier from Zoho CRM. Returns the note\'s title, content, parent record reference, owner details, and timestamps. Use this action when you need to fetch detailed information about a specific note, such as reading meeting notes, viewing customer interaction s',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        fields: z.string().min(1).optional().describe('Comma-separated API names of the fields to retrieve. Common fields: Note_Title, Note_Content, Parent_Id, Owner, Created_Time, Modified_Time, Created_By, Modified_By. This parameter is required by the '),
        note_id: z.string().describe('The unique identifier of the note to retrieve'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/Notes/${p.note_id}`;
            const query: any = {};
            if (p.fields) query.fields = p.fields;
            if (p.module_api_name) query.module = p.module_api_name;
            const res = await zohoFetch(path, { zohoToken, method: 'GET', query });
            if (!res.ok) return { error: 'Failed to get', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoGetNote', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
