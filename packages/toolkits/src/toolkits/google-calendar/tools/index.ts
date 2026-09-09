// @ts-nocheck
import { listEvents } from './list-events.js';
import { createEvent } from './create-event.js';
import { getEvent } from './get-event.js';
import { updateEvent } from './update-event.js';
import { deleteEvent } from './delete-event.js';
import { searchEvents } from './search-events.js';

export { listEvents, createEvent, getEvent, updateEvent, deleteEvent, searchEvents };

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
    {
        name: 'getEvent',
        description: 'Get details of a specific event from Google Calendar by event ID.',
        tool: getEvent,
        requiredAuth: 'googleCalendarToken',
    },
    {
        name: 'updateEvent',
        description: 'Update or reschedule an existing event in Google Calendar (e.g., change summary, start/end time, description, or location).',
        tool: updateEvent,
        requiredAuth: 'googleCalendarToken',
    },
    {
        name: 'deleteEvent',
        description: 'Delete or cancel an event from Google Calendar by event ID.',
        tool: deleteEvent,
        requiredAuth: 'googleCalendarToken',
    },
    {
        name: 'searchEvents',
        description: 'Search for events in Google Calendar matching a free text query and/or date range.',
        tool: searchEvents,
        requiredAuth: 'googleCalendarToken',
    },
];
