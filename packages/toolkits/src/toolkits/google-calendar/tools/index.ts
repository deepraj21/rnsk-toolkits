// @ts-nocheck
import { listEvents } from './list-events';
import { createEvent } from './create-event';

export const googleCalendarTools = [
    {
        name: 'listEvents',
        description: 'List upcoming events from your primary Google Calendar. Returns event summaries, start/end times, and IDs.',
        tool: listEvents,
        requiredAuth: 'googleCalendarToken',
    },
    {
        name: 'createEvent',
        description: 'Create a new event in your primary Google Calendar by providing a summary, start time, and end time. You can also optionaly provide a description and location.',
        tool: createEvent,
        requiredAuth: 'googleCalendarToken',
    },
];
