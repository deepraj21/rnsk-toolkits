// @ts-nocheck
import { addMeetingRegistrant } from './add-meeting-registrant.js';
import { createMeeting } from './create-meeting.js';
import { createWebinar } from './create-webinar.js';
import { deleteMeeting } from './delete-meeting.js';
import { deleteMeetingRecordings } from './delete-meeting-recordings.js';
import { endMeeting } from './end-meeting.js';
import { getCurrentUser } from './get-current-user.js';
import { getMeeting } from './get-meeting.js';
import { getMeetingRecordings } from './get-meeting-recordings.js';
import { listMeetingRegistrants } from './list-meeting-registrants.js';
import { listMeetings } from './list-meetings.js';
import { listRecordings } from './list-recordings.js';
import { listWebinars } from './list-webinars.js';
import { updateMeeting } from './update-meeting.js';

export {
  addMeetingRegistrant,
  createMeeting,
  createWebinar,
  deleteMeeting,
  deleteMeetingRecordings,
  endMeeting,
  getCurrentUser,
  getMeeting,
  getMeetingRecordings,
  listMeetingRegistrants,
  listMeetings,
  listRecordings,
  listWebinars,
  updateMeeting,
};

export const zoomTools = [
  {
    name: 'zoomCreateMeeting',
    description:
      'Creates a Zoom meeting for the connected user and returns the meeting ID, join URL, and start time. Use to schedule a new meeting.',
    tool: createMeeting,
    requiredAuth: 'zoomToken' as const,
    scope: 'write' as const,
    keywords: ['schedule', 'conference', 'invite', 'join link'],
  },
  {
    name: 'zoomListMeetings',
    description:
      "Lists the connected user's Zoom meetings (scheduled, upcoming, or live) with pagination. Use to find upcoming calls and their join links.",
    tool: listMeetings,
    requiredAuth: 'zoomToken' as const,
    scope: 'read' as const,
    keywords: ['agenda', 'calendar', 'bookings'],
  },
  {
    name: 'zoomGetMeeting',
    description:
      'Gets full details of a Zoom meeting by meeting ID: topic, start time, join URL, password, agenda, and settings.',
    tool: getMeeting,
    requiredAuth: 'zoomToken' as const,
    scope: 'read' as const,
    keywords: ['details', 'passcode', 'invite link'],
  },
  {
    name: 'zoomUpdateMeeting',
    description:
      'Updates a Zoom meeting — change topic, start time, duration, timezone, agenda, or settings. Use to reschedule or rename an existing meeting.',
    tool: updateMeeting,
    requiredAuth: 'zoomToken' as const,
    scope: 'write' as const,
    keywords: ['reschedule', 'edit', 'rename', 'postpone'],
  },
  {
    name: 'zoomDeleteMeeting',
    description:
      'Deletes a scheduled Zoom meeting permanently. Use only when the user explicitly asks to cancel or remove a meeting.',
    tool: deleteMeeting,
    requiredAuth: 'zoomToken' as const,
    scope: 'delete' as const,
    keywords: ['cancel', 'remove', 'erase'],
  },
  {
    name: 'zoomEndMeeting',
    description:
      'Ends a live Zoom meeting immediately for all participants. Use when the user wants to stop an in-progress call.',
    tool: endMeeting,
    requiredAuth: 'zoomToken' as const,
    scope: 'write' as const,
    keywords: ['hang up', 'terminate', 'stop', 'close'],
  },
  {
    name: 'zoomListMeetingRegistrants',
    description:
      'Lists registrants of a Zoom meeting that has registration enabled, filtered by approval status (approved, pending, or denied).',
    tool: listMeetingRegistrants,
    requiredAuth: 'zoomToken' as const,
    scope: 'read' as const,
    keywords: ['attendees', 'invitees', 'signups', 'guests'],
  },
  {
    name: 'zoomAddMeetingRegistrant',
    description:
      'Registers an attendee for a Zoom meeting with registration enabled and returns their unique join URL. Use to sign up an invitee by email.',
    tool: addMeetingRegistrant,
    requiredAuth: 'zoomToken' as const,
    scope: 'write' as const,
    keywords: ['attendee', 'invitee', 'signup', 'guest'],
  },
  {
    name: 'zoomGetMeetingRecordings',
    description:
      "Gets cloud recordings for a Zoom meeting or meeting UUID: recording files, download URLs, and share link. Use to retrieve a past meeting's recording.",
    tool: getMeetingRecordings,
    requiredAuth: 'zoomToken' as const,
    scope: 'read' as const,
    keywords: ['transcript', 'download', 'replay', 'vod'],
  },
  {
    name: 'zoomListRecordings',
    description:
      "Lists the connected user's cloud recordings across meetings within a date range (defaults to the last 30 days). Use to find recorded sessions and their download URLs.",
    tool: listRecordings,
    requiredAuth: 'zoomToken' as const,
    scope: 'read' as const,
    keywords: ['transcripts', 'replay', 'vod', 'archive'],
  },
  {
    name: 'zoomDeleteMeetingRecordings',
    description:
      "Deletes a meeting's cloud recordings — moves them to trash (default) or erases them permanently. Use action 'delete' only when the user explicitly asks to permanently erase recordings.",
    tool: deleteMeetingRecordings,
    requiredAuth: 'zoomToken' as const,
    scope: 'delete' as const,
    keywords: ['trash', 'purge', 'remove', 'erase'],
  },
  {
    name: 'zoomGetCurrentUser',
    description:
      "Gets the connected Zoom user's profile: ID, email, timezone, personal meeting ID (PMI), and personal meeting URL. Use to confirm who is connected before scheduling.",
    tool: getCurrentUser,
    requiredAuth: 'zoomToken' as const,
    scope: 'read' as const,
    keywords: ['profile', 'account', 'pmi', 'host'],
  },
  {
    name: 'zoomListWebinars',
    description:
      "Lists the connected user's Zoom webinars (scheduled, upcoming, or live) with pagination. Use when managing webinars rather than regular meetings.",
    tool: listWebinars,
    requiredAuth: 'zoomToken' as const,
    scope: 'read' as const,
    keywords: ['event', 'seminar', 'broadcast', 'session'],
  },
  {
    name: 'zoomCreateWebinar',
    description:
      'Schedules a Zoom webinar for the connected webinar host and returns the webinar ID and join/registration URL. Requires a webinar-licensed Zoom user.',
    tool: createWebinar,
    requiredAuth: 'zoomToken' as const,
    scope: 'write' as const,
    keywords: ['event', 'seminar', 'broadcast', 'host'],
  },
];
