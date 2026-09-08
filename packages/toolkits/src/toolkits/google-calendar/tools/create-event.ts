// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const createEvent = tool({
    description: 'Create a new event in the user\'s primary Google Calendar.',
    inputSchema: z.object({
        googleCalendarToken: z.string().describe('The Google Calendar access token'),
        summary: z.string().describe('Summary/Title of the event'),
        description: z.string().optional().describe('Description of the event'),
        start: z.string().describe('Start time (RFC3339 timestamp, e.g., 2023-01-01T10:00:00Z)'),
        end: z.string().describe('End time (RFC3339 timestamp, e.g., 2023-01-01T11:00:00Z)'),
        location: z.string().optional().describe('Location of the event'),
    }),
    execute: async ({ googleCalendarToken, summary, description, start, end, location }) => {
        try {
            const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

            const event = {
                summary,
                description,
                start: {
                    dateTime: start,
                },
                end: {
                    dateTime: end,
                },
                location,
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${googleCalendarToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to create event', details: error };
            }

            const data = await response.json();
            return {
                success: true,
                event: data,
            };
        } catch (error) {
            return {
                error: 'Error creating event',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
