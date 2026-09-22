// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoUpdateEvent = tool({
    description: 'Updates existing events in Zoho CRM. Supports updating up to 100 events per API call. Use this action when you need to modify event details such as title, start/end times, location, participants, or related records (What_Id/Who_Id). The \'id\' field is mandatory for each event, and only specified fi',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        data: z.array(z.record(z.any())).describe('A list of dictionaries representing the events to be updated. Each event MUST include the \'id\' field with the event ID to update. Update up to 100 events per API call. Common event fields: Event_Tit'),
        trigger: z.array(z.string()).optional().describe('List of automation triggers to execute during update. Valid values: [\'workflow\', \'approval\', \'blueprint\', \'pathfinder\', \'orchestration\']. Pass empty array [] to skip all automation. If not s'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/Events`;
            // For bulk updates, Zoho expects {data: [...]}
            const body = p.data ? { data: p.data, trigger: p.trigger } : { data: [p] };
            const res = await zohoFetch(path, { zohoToken, method: 'PUT', body });
            if (!res.ok) return { error: 'Failed to update', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoUpdateEvent', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
