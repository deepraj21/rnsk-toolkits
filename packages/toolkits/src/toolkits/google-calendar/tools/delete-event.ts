// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const deleteEvent = tool({
    description: 'Delete or cancel an event from Google Calendar by event ID.',
    inputSchema: z.object({
        googleCalendarToken: z.string().describe('The Google Calendar access token'),
        eventId: z.string().describe('The unique ID of the event to delete'),
        calendarId: z.string().optional().default('primary').describe('Calendar identifier. Default is "primary".'),
    }),
    execute: async ({ googleCalendarToken, eventId, calendarId = 'primary' }) => {
        try {
            const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`;

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${googleCalendarToken}`,
                },
            });

            if (!response.ok && response.status !== 204) {
                const error = await response.json().catch(() => ({ status: response.status }));
                return { error: 'Failed to delete event', details: error };
            }

            return {
                success: true,
                eventId,
                calendarId,
            };
        } catch (error) {
            return {
                error: 'Error deleting event',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
