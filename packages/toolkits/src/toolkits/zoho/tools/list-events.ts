// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoListEvents = tool({
    description: 'Lists events (meetings) from Zoho CRM with pagination and filtering support. Use this action when you need to retrieve scheduled events, meetings, or appointments from Zoho CRM for calendar management, reporting, or synchronization purposes. Note: In Zoho CRM UI, Events are displayed as \'Meetings\'',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        ids: z.string().optional().describe('Comma-separated event record IDs to fetch specific events. This parameter is ignored when page_token is provided.'),
        cvid: z.number().int().optional().describe('Custom view ID to filter the events. Cannot be used together with sort_by. This parameter is ignored when page_token is provided.'),
        page: z.number().int().min(1).optional().describe('Page number to retrieve. Without page_token, only the first 2,000 events are accessible. Maximum page number is floor(2000/per_page). Cannot be used together with page_token.'),
        fields: z.string().describe('Comma-separated API names of fields to retrieve (max 50). This parameter is required by the Zoho CRM API. Common Events fields: Event_Title, Start_DateTime, End_DateTime, Location, Venue, Description,'),
        sort_by: z.string().optional().describe('Valid fields for sorting Zoho CRM Events.'),
        per_page: z.number().int().min(1).max(200).optional().describe('Number of events per page (max 200). Default: 25. Applies to both page and page_token pagination.'),
        page_token: z.string().optional().describe('Token-based pagination to fetch events beyond the 2,000-record limit. Use next_page_token from the previous response. Cannot be used with page parameter.'),
        sort_order: z.string().optional().describe('Sort order for events.'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/Events`;
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
            return { error: 'Error in ZohoListEvents', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
