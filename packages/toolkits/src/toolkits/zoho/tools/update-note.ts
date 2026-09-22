// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoUpdateNote = tool({
    description: 'Updates an existing note in Zoho CRM. Only the Note_Title and Note_Content fields can be modified. Read-only fields (Owner, Modified_Time, Created_Time, Modified_By, Created_By) cannot be updated and will be ignored if provided. Use this action when you need to modify the title or content of an exis',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        id: z.string().describe('The unique identifier of the note to update'),
        Note_Title: z.string().optional().describe('Updated title of the note. If not provided, the existing title remains unchanged.'),
        Note_Content: z.string().optional().describe('Updated content/body of the note. If not provided, the existing content remains unchanged.'),
        is_shared_to_client: z.boolean().optional().describe('Controls portal user visibility. Set to true to share note with portal users, false to keep private. If not provided, the existing setting remains unchanged.'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/Notes/${p.id}`;
            // For bulk updates, Zoho expects {data: [...]}
            const body = p.data ? { data: p.data, trigger: p.trigger } : { data: [p] };
            const res = await zohoFetch(path, { zohoToken, method: 'PUT', body });
            if (!res.ok) return { error: 'Failed to update', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoUpdateNote', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
