// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const searchEvents = tool({
    description: 'Search for events in Google Calendar matching a free text query and/or date range.',
    inputSchema: z.object({
        googleCalendarToken: z.string().describe('The Google Calendar access token'),
        q: z.string().optional().describe('Free text search terms to find events (e.g. "team sync", "meeting with Alice")'),
        calendarId: z.string().optional().default('primary').describe('Calendar identifier. Default is "primary".'),
        timeMin: z.string().optional().describe('Lower bound (exclusive) for event end times (RFC3339 timestamp)'),
        timeMax: z.string().optional().describe('Upper bound (exclusive) for event start times (RFC3339 timestamp)'),
        maxResults: z.number().optional().default(10).describe('Maximum number of events to return'),
    }),
    execute: async ({ googleCalendarToken, q, calendarId = 'primary', timeMin, timeMax, maxResults }) => {
        try {
            const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
            url.searchParams.append('maxResults', maxResults.toString());
            url.searchParams.append('singleEvents', 'true');
            url.searchParams.append('orderBy', 'startTime');

            if (q) url.searchParams.append('q', q);
            if (timeMin) url.searchParams.append('timeMin', timeMin);
            if (timeMax) url.searchParams.append('timeMax', timeMax);

            const response = await fetch(url.toString(), {
                headers: {
                    Authorization: `Bearer ${googleCalendarToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to search events', details: error };
            }

            const data = await response.json();
            return {
                events: data.items || [],
                summary: data.summary,
            };
        } catch (error) {
            return {
                error: 'Error searching events',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
