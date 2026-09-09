// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const updateEvent = tool({
    description: 'Update or reschedule an existing event in Google Calendar (e.g., change summary, start/end time, description, or location).',
    inputSchema: z.object({
        googleCalendarToken: z.string().describe('The Google Calendar access token'),
        eventId: z.string().describe('The unique ID of the event to update'),
        calendarId: z.string().optional().default('primary').describe('Calendar identifier. Default is "primary".'),
        summary: z.string().optional().describe('New summary/title of the event'),
        description: z.string().optional().describe('New description of the event'),
        start: z.string().optional().describe('New start time (RFC3339 timestamp, e.g., 2026-09-10T10:00:00Z)'),
        end: z.string().optional().describe('New end time (RFC3339 timestamp, e.g., 2026-09-10T11:00:00Z)'),
        location: z.string().optional().describe('New location of the event'),
    }),
    execute: async ({ googleCalendarToken, eventId, calendarId = 'primary', summary, description, start, end, location }) => {
        try {
            const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`;

            const updatePayload: Record<string, any> = {};
            if (summary !== undefined) updatePayload.summary = summary;
            if (description !== undefined) updatePayload.description = description;
            if (location !== undefined) updatePayload.location = location;
            if (start !== undefined) updatePayload.start = { dateTime: start };
            if (end !== undefined) updatePayload.end = { dateTime: end };

            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${googleCalendarToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatePayload),
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to update event', details: error };
            }

            const data = await response.json();
            return {
                success: true,
                event: data,
            };
        } catch (error) {
            return {
                error: 'Error updating event',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
