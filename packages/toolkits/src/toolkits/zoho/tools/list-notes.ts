// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoListNotes = tool({
    description: 'Retrieves a list of notes from Zoho CRM across all modules. Notes are returned in chronological order (oldest first by default). Use this action when you need to view all notes in the CRM, regardless of which record they\'re attached to. Each note includes its title, content, creator, timestamps, an',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        page: z.number().int().min(1).optional().describe('Page number to retrieve. Default is 1.'),
        fields: z.string().describe('Comma-separated API names of the fields to retrieve. This parameter is mandatory. Common fields: Note_Title, Note_Content, Owner, Created_Time, Modified_Time, Parent_Id. Example: \'Note_Title,Note_Con'),
        per_page: z.number().int().min(1).max(200).optional().describe('Number of notes per page. Default is 25, maximum is 200.'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/Notes`;
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
            return { error: 'Error in ZohoListNotes', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
