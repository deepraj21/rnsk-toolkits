// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const getEvent = tool({
    description: 'Get details of a specific event from Google Calendar by event ID.',
    inputSchema: z.object({
        googleCalendarToken: z.string().describe('The Google Calendar access token'),
        eventId: z.string().describe('The unique ID of the event to retrieve'),
        calendarId: z.string().optional().default('primary').describe('Calendar identifier. Default is "primary".'),
    }),
    execute: async ({ googleCalendarToken, eventId, calendarId = 'primary' }) => {
        try {
            const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${googleCalendarToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to get event', details: error };
            }

            const data = await response.json();
            return {
                success: true,
                event: data,
            };
        } catch (error) {
            return {
                error: 'Error getting event',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
