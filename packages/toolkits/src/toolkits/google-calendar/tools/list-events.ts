// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const listEvents = tool({
    description: 'List upcoming events from the user\'s primary Google Calendar.',
    inputSchema: z.object({
        googleCalendarToken: z.string().describe('The Google Calendar access token'),
        maxResults: z.number().optional().default(10).describe('Maximum number of events to return'),
        timeMin: z.string().optional().describe('Lower bound (exclusive) for an event\'s end time to filter by (RFC3339 timestamp). Default is now.'),
    }),
    execute: async ({ googleCalendarToken, maxResults, timeMin }) => {
        try {
            const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
            url.searchParams.append('maxResults', maxResults.toString());
            url.searchParams.append('singleEvents', 'true');
            url.searchParams.append('orderBy', 'startTime');

            if (timeMin) {
                url.searchParams.append('timeMin', timeMin);
            } else {
                url.searchParams.append('timeMin', new Date().toISOString());
            }

            const response = await fetch(url.toString(), {
                headers: {
                    Authorization: `Bearer ${googleCalendarToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to list events', details: error };
            }

            const data = await response.json();
            return {
                events: data.items || [],
                summary: data.summary,
            };
        } catch (error) {
            return {
                error: 'Error listing events',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
