// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoCreateNote = tool({
    description: 'Creates a new note attached to a specific record in Zoho CRM. Notes are text annotations that can be added to any standard or custom module record. Use this action when you need to add notes, comments, or text-based documentation to a record in Zoho CRM. The note will be visible in the record\'s Not',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        record_id: z.string().describe('The unique identifier of the parent record to attach the note to. This is the ID of the record in the specified module.'),
        Note_Title: z.string().optional().describe('Optional title for the note'),
        Note_Content: z.string().describe('The content/text of the note (required)'),
        module_api_name: z.string().describe('The API name of the parent module containing the record. Examples: \'Leads\', \'Contacts\', \'Accounts\', \'Deals\', \'Tasks\', etc. This must be a valid module API name in Zoho CRM.'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/${p.module_api_name}/${p.record_id}/Notes`;
            const res = await zohoFetch(path, { zohoToken, method: 'POST', body: p });
            if (!res.ok) return { error: 'Failed', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoCreateNote', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
