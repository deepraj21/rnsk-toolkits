// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoCreateEvent = tool({
    description: 'Creates a new Event record in Zoho CRM. Events represent scheduled activities like meetings, calls, or appointments. Use this action when you need to schedule a new event or meeting in the CRM system. All events require an event title, start time, and end time at minimum.',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        Owner: z.record(z.any()).optional().describe('Reference to another record in the CRM.'),
        Venue: z.string().optional().describe('Location or venue of the event'),
        Who_Id: z.record(z.any()).optional().describe('Reference to another record in the CRM.'),
        All_day: z.boolean().optional().describe('Indicates whether the event spans an entire day or multiple days'),
        What_Id: z.record(z.any()).optional().describe('Reference to another record in the CRM.'),
        trigger: z.array(z.string()).optional().describe('List of triggers to invoke (e.g., [\'workflow\', \'blueprint\']). Use cautiously as triggers can cause side effects like sending emails'),
        Remind_At: z.array(z.record(z.any())).optional().describe('List of reminder configurations for the event. Each reminder specifies when to alert before the event starts'),
        Description: z.string().optional().describe('Detailed description of the event'),
        Event_Title: z.string().describe('Name of the event. Required field that accepts alphanumeric and special characters'),
        End_DateTime: z.string().describe('Event end date and time in ISO8601 format (e.g., \'2024-07-03T14:30:00+05:30\')'),
        Participants: z.array(z.record(z.any())).optional().describe('List of event participants (leads, contacts, users, or email addresses)'),
        Start_DateTime: z.string().describe('Event start date and time in ISO8601 format (e.g., \'2024-07-03T12:30:00+05:30\')'),
        Check_In_Status: z.string().optional().describe('Check-in status for the event'),
        Recurring_Activity: z.record(z.any()).optional().describe('Recurrence rule for the event in RRULE format.'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const body = { data: [rest] };
            const res = await zohoFetch('/Events', { zohoToken, method: 'POST', body });
            if (!res.ok) return { error: 'Failed to create events', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoCreateEvent', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
