// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { graphRequest, mailboxBase, failedResult, toOutlookError } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const mailboxField = z
  .string()
  .optional()
  .describe('Mailbox user ID or UPN for shared/delegated mailboxes (default signed-in user)');
const eventIdField = z.string().describe('Event ID');

const dateTimeField = (label: string) =>
  z
    .object({
      dateTime: z.string().describe('ISO datetime, e.g. 2026-10-08T12:00:00'),
      timeZone: z.string().describe('Windows time zone, e.g. Pacific Standard Time'),
    })
    .describe(label);

export const outlookListCalendars = tool({
  description:
    'List calendars with names, colors, and default flags. Use to discover calendar IDs.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
  }),
  execute: async ({ outlookToken, mailbox }) => {
    try {
      const result = await graphRequest(outlookToken, `${mailboxBase(mailbox)}/calendars`);
      if (!result.ok) return failedResult('Failed to list calendars', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error listing calendars');
    }
  },
});

export const outlookGetCalendar = tool({
  description: 'Get one calendar with settings.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    calendarId: z.string().describe('Calendar ID'),
  }),
  execute: async ({ outlookToken, mailbox, calendarId }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/calendars/${calendarId}`,
      );
      if (!result.ok) return failedResult('Failed to get calendar', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error getting calendar');
    }
  },
});

export const outlookCreateCalendar = tool({
  description: 'Create a calendar with a name and color.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    name: z.string().describe('Calendar name'),
    color: z.string().optional().describe('Color, e.g. auto, lightBlue, ...'),
  }),
  execute: async ({ outlookToken, mailbox, name, color }) => {
    try {
      const result = await graphRequest(outlookToken, `${mailboxBase(mailbox)}/calendars`, {
        method: 'POST',
        body: { name, ...(color !== undefined ? { color } : {}) },
      });
      if (!result.ok) return failedResult('Failed to create calendar', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error creating calendar');
    }
  },
});

export const outlookUpdateCalendar = tool({
  description: 'Update a calendar name, color, or sharing settings.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    calendarId: z.string().describe('Calendar ID'),
    calendar: z.record(z.string(), z.any()).describe('Calendar fields to update'),
  }),
  execute: async ({ outlookToken, mailbox, calendarId, calendar }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/calendars/${calendarId}`,
        { method: 'PATCH', body: calendar },
      );
      if (!result.ok) return failedResult('Failed to update calendar', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error updating calendar');
    }
  },
});

export const outlookDeleteCalendar = tool({
  description: 'Delete a calendar and all its events.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    calendarId: z.string().describe('Calendar ID'),
  }),
  execute: async ({ outlookToken, mailbox, calendarId }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/calendars/${calendarId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete calendar', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toOutlookError(error, 'Error deleting calendar');
    }
  },
});

export const outlookListEvents = tool({
  description: 'List events in the default or a specific calendar with filter and paging.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    calendarId: z.string().optional().describe('Calendar ID (omit for default calendar events)'),
    filter: z.string().optional().describe("OData filter, e.g. start/dateTime ge '2026-10-01'"),
    orderBy: z.string().optional().describe('Order, e.g. start/dateTime'),
    select: z.string().optional().describe('Comma-separated fields to return'),
    top: z.number().int().min(1).max(100).optional().describe('Events per page'),
    skip: z.number().int().min(0).optional().describe('Events to skip'),
  }),
  execute: async ({ outlookToken, mailbox, calendarId, filter, orderBy, select, top, skip }) => {
    try {
      const path =
        calendarId !== undefined
          ? `${mailboxBase(mailbox)}/calendars/${calendarId}/events`
          : `${mailboxBase(mailbox)}/events`;
      const result = await graphRequest(outlookToken, path, {
        query: { $filter: filter, $orderby: orderBy, $select: select, $top: top, $skip: skip },
      });
      if (!result.ok) return failedResult('Failed to list events', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error listing events');
    }
  },
});

export const outlookListCalendarView = tool({
  description:
    'List event occurrences expanded in a time window (recurrences expanded). Use for agenda views.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    calendarId: z.string().optional().describe('Calendar ID (omit for default calendar view)'),
    startDateTime: z.string().describe('Window start ISO datetime'),
    endDateTime: z.string().describe('Window end ISO datetime'),
    top: z.number().int().min(1).max(100).optional().describe('Occurrences per page'),
  }),
  execute: async ({ outlookToken, mailbox, calendarId, startDateTime, endDateTime, top }) => {
    try {
      const path =
        calendarId !== undefined
          ? `${mailboxBase(mailbox)}/calendars/${calendarId}/calendarView`
          : `${mailboxBase(mailbox)}/calendarView`;
      const result = await graphRequest(outlookToken, path, {
        query: { startDateTime, endDateTime, $top: top },
      });
      if (!result.ok) return failedResult('Failed to list calendar view', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error listing calendar view');
    }
  },
});

export const outlookGetEvent = tool({
  description: 'Get one event with attendees, location, recurrence, and online meeting info.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    eventId: eventIdField,
  }),
  execute: async ({ outlookToken, mailbox, eventId }) => {
    try {
      const result = await graphRequest(outlookToken, `${mailboxBase(mailbox)}/events/${eventId}`);
      if (!result.ok) return failedResult('Failed to get event', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error getting event');
    }
  },
});

export const outlookCreateEvent = tool({
  description:
    'Create a meeting/event: subject, start/end with time zones, attendees, location, recurrence, online meeting, reminders.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    calendarId: z.string().optional().describe('Calendar ID (omit for default calendar)'),
    event: z
      .record(z.string(), z.any())
      .describe(
        'Event: subject, body {contentType, content}, start/end {dateTime, timeZone}, location {displayName}, attendees [{emailAddress:{address,name}, type}], recurrence {pattern, range}, isOnlineMeeting, onlineMeetingProvider, reminderMinutesBeforeStart',
      ),
  }),
  execute: async ({ outlookToken, mailbox, calendarId, event }) => {
    try {
      const path =
        calendarId !== undefined
          ? `${mailboxBase(mailbox)}/calendars/${calendarId}/events`
          : `${mailboxBase(mailbox)}/events`;
      const result = await graphRequest(outlookToken, path, { method: 'POST', body: event });
      if (!result.ok) return failedResult('Failed to create event', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error creating event');
    }
  },
});

export const outlookUpdateEvent = tool({
  description: 'Update an event (time, attendees, location, recurrence).',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    eventId: eventIdField,
    event: z.record(z.string(), z.any()).describe('Event fields to update'),
  }),
  execute: async ({ outlookToken, mailbox, eventId, event }) => {
    try {
      const result = await graphRequest(outlookToken, `${mailboxBase(mailbox)}/events/${eventId}`, {
        method: 'PATCH',
        body: event,
      });
      if (!result.ok) return failedResult('Failed to update event', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error updating event');
    }
  },
});

export const outlookDeleteEvent = tool({
  description: 'Delete an event (cancels without notification; use Cancel Event to notify).',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    eventId: eventIdField,
  }),
  execute: async ({ outlookToken, mailbox, eventId }) => {
    try {
      const result = await graphRequest(outlookToken, `${mailboxBase(mailbox)}/events/${eventId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete event', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toOutlookError(error, 'Error deleting event');
    }
  },
});

export const outlookCancelEvent = tool({
  description: 'Cancel a meeting and notify attendees with an optional comment.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    eventId: eventIdField,
    comment: z.string().optional().describe('Cancellation message to attendees'),
  }),
  execute: async ({ outlookToken, mailbox, eventId, comment }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/events/${eventId}/cancel`,
        {
          method: 'POST',
          body: comment !== undefined ? { comment } : {},
        },
      );
      if (!result.ok) return failedResult('Failed to cancel event', result);
      return result.data ?? { cancelled: true };
    } catch (error) {
      return toOutlookError(error, 'Error canceling event');
    }
  },
});

function rsvpAction(action: 'accept' | 'tentativelyAccept' | 'decline', past: string) {
  return tool({
    description: `${action === 'accept' ? 'Accept' : action === 'decline' ? 'Decline' : 'Tentatively accept'} a meeting invitation with an optional comment.`,
    inputSchema: z.object({
      outlookToken: tokenField,
      mailbox: mailboxField,
      eventId: eventIdField,
      comment: z.string().optional().describe('Response message to the organizer'),
      sendResponse: z.boolean().optional().describe('Send the response email (default true)'),
    }),
    execute: async ({ outlookToken, mailbox, eventId, comment, sendResponse }: any) => {
      try {
        const result = await graphRequest(
          outlookToken,
          `${mailboxBase(mailbox)}/events/${eventId}/${action}`,
          {
            method: 'POST',
            body: {
              ...(comment !== undefined ? { comment } : {}),
              ...(sendResponse !== undefined ? { sendResponse } : {}),
            },
          },
        );
        if (!result.ok) return failedResult(`Failed to ${action} event`, result);
        return result.data ?? { [past]: true };
      } catch (error) {
        return toOutlookError(error, `Error ${action}ing event`);
      }
    },
  });
}

export const outlookAcceptEvent = rsvpAction('accept', 'accepted');
export const outlookTentativelyAcceptEvent = rsvpAction('tentativelyAccept', 'tentativelyAccepted');
export const outlookDeclineEvent = rsvpAction('decline', 'declined');

export const outlookGetSchedule = tool({
  description:
    'Get free/busy schedule for users, rooms, or resources in a window. Use to find meeting times.',
  inputSchema: z.object({
    outlookToken: tokenField,
    schedules: z.array(z.string()).min(1).describe('SMTP addresses or UPNs to check'),
    startTime: dateTimeField('Window start with time zone'),
    endTime: dateTimeField('Window end with time zone'),
    availabilityViewInterval: z
      .number()
      .int()
      .min(5)
      .optional()
      .describe('Slot minutes (default 30)'),
  }),
  execute: async ({ outlookToken, schedules, startTime, endTime, availabilityViewInterval }) => {
    try {
      const result = await graphRequest(outlookToken, '/me/calendar/getSchedule', {
        method: 'POST',
        body: {
          schedules,
          startTime,
          endTime,
          ...(availabilityViewInterval !== undefined ? { availabilityViewInterval } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to get schedule', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error getting schedule');
    }
  },
});

export const outlookSnoozeReminder = tool({
  description: 'Snooze an event reminder to a new time.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    eventId: eventIdField,
    newReminderTime: dateTimeField('New reminder time with time zone'),
  }),
  execute: async ({ outlookToken, mailbox, eventId, newReminderTime }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/events/${eventId}/snoozeReminder`,
        { method: 'POST', body: { newReminderTime } },
      );
      if (!result.ok) return failedResult('Failed to snooze reminder', result);
      return result.data ?? { snoozed: true };
    } catch (error) {
      return toOutlookError(error, 'Error snoozing reminder');
    }
  },
});

export const outlookDismissReminder = tool({
  description: 'Dismiss an event reminder.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    eventId: eventIdField,
  }),
  execute: async ({ outlookToken, mailbox, eventId }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/events/${eventId}/dismissReminder`,
        { method: 'POST' },
      );
      if (!result.ok) return failedResult('Failed to dismiss reminder', result);
      return result.data ?? { dismissed: true };
    } catch (error) {
      return toOutlookError(error, 'Error dismissing reminder');
    }
  },
});

export const outlookListEventAttachments = tool({
  description: 'List attachments of a calendar event.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    eventId: eventIdField,
  }),
  execute: async ({ outlookToken, mailbox, eventId }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/events/${eventId}/attachments`,
      );
      if (!result.ok) return failedResult('Failed to list event attachments', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error listing event attachments');
    }
  },
});

export const outlookAddEventAttachment = tool({
  description: 'Attach a file (base64) to a calendar event.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    eventId: eventIdField,
    name: z.string().describe('File name'),
    contentType: z.string().describe('MIME type'),
    contentBytes: z.string().describe('File content base64-encoded'),
  }),
  execute: async ({ outlookToken, mailbox, eventId, name, contentType, contentBytes }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/events/${eventId}/attachments`,
        {
          method: 'POST',
          body: {
            '@odata.type': '#microsoft.graph.fileAttachment',
            name,
            contentType,
            contentBytes,
          },
        },
      );
      if (!result.ok) return failedResult('Failed to add event attachment', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error adding event attachment');
    }
  },
});

export const outlookDeleteEventAttachment = tool({
  description: 'Delete an attachment from a calendar event.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    eventId: eventIdField,
    attachmentId: z.string().describe('Attachment ID'),
  }),
  execute: async ({ outlookToken, mailbox, eventId, attachmentId }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/events/${eventId}/attachments/${attachmentId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete event attachment', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toOutlookError(error, 'Error deleting event attachment');
    }
  },
});
