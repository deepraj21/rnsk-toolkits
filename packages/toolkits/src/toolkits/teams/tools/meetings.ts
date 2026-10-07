// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { graphRequest, failedResult, toTeamsError } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const teamsCreateOnlineMeeting = tool({
  description:
    'Create a standalone Teams online meeting (join link, dial-in, chat) not tied to a calendar event.',
  inputSchema: z.object({
    teamsToken: tokenField,
    startDateTime: z.string().describe('Start ISO datetime with offset'),
    endDateTime: z.string().describe('End ISO datetime with offset'),
    subject: z.string().optional().describe('Meeting subject'),
    lobbyBypassScope: z.string().optional().describe('Lobby bypass, e.g. everyone, organization'),
    allowedPresenters: z
      .string()
      .optional()
      .describe('Presenter scope, e.g. everyone, organization'),
  }),
  execute: async ({
    teamsToken,
    startDateTime,
    endDateTime,
    subject,
    lobbyBypassScope,
    allowedPresenters,
  }) => {
    try {
      const result = await graphRequest(teamsToken, '/me/onlineMeetings', {
        method: 'POST',
        body: {
          startDateTime,
          endDateTime,
          ...(subject !== undefined ? { subject } : {}),
          ...(lobbyBypassScope !== undefined
            ? { lobbyBypassSettings: { scope: lobbyBypassScope } }
            : {}),
          ...(allowedPresenters !== undefined ? { allowedPresenters } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create online meeting', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error creating online meeting');
    }
  },
});

export const teamsGetOnlineMeeting = tool({
  description: 'Get one online meeting with join URL, dial-in, and chat info.',
  inputSchema: z.object({
    teamsToken: tokenField,
    meetingId: z.string().describe('Online meeting ID'),
  }),
  execute: async ({ teamsToken, meetingId }) => {
    try {
      const result = await graphRequest(teamsToken, `/me/onlineMeetings/${meetingId}`);
      if (!result.ok) return failedResult('Failed to get online meeting', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error getting online meeting');
    }
  },
});

export const teamsUpdateOnlineMeeting = tool({
  description: 'Update an online meeting (time, subject, lobby, presenters).',
  inputSchema: z.object({
    teamsToken: tokenField,
    meetingId: z.string().describe('Online meeting ID'),
    meeting: z.record(z.string(), z.any()).describe('Meeting fields to update'),
  }),
  execute: async ({ teamsToken, meetingId, meeting }) => {
    try {
      const result = await graphRequest(teamsToken, `/me/onlineMeetings/${meetingId}`, {
        method: 'PATCH',
        body: meeting,
      });
      if (!result.ok) return failedResult('Failed to update online meeting', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error updating online meeting');
    }
  },
});

export const teamsDeleteOnlineMeeting = tool({
  description: 'Delete a standalone online meeting.',
  inputSchema: z.object({
    teamsToken: tokenField,
    meetingId: z.string().describe('Online meeting ID'),
  }),
  execute: async ({ teamsToken, meetingId }) => {
    try {
      const result = await graphRequest(teamsToken, `/me/onlineMeetings/${meetingId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete online meeting', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toTeamsError(error, 'Error deleting online meeting');
    }
  },
});

export const teamsListAttendanceReports = tool({
  description: 'List attendance reports of an online meeting.',
  inputSchema: z.object({
    teamsToken: tokenField,
    meetingId: z.string().describe('Online meeting ID'),
  }),
  execute: async ({ teamsToken, meetingId }) => {
    try {
      const result = await graphRequest(
        teamsToken,
        `/me/onlineMeetings/${meetingId}/attendanceReports`,
      );
      if (!result.ok) return failedResult('Failed to list attendance reports', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error listing attendance reports');
    }
  },
});

export const teamsListAttendanceRecords = tool({
  description: 'List per-attendee attendance records (join/leave times, duration).',
  inputSchema: z.object({
    teamsToken: tokenField,
    meetingId: z.string().describe('Online meeting ID'),
    reportId: z.string().describe('Attendance report ID'),
  }),
  execute: async ({ teamsToken, meetingId, reportId }) => {
    try {
      const result = await graphRequest(
        teamsToken,
        `/me/onlineMeetings/${meetingId}/attendanceReports/${reportId}/attendanceRecords`,
      );
      if (!result.ok) return failedResult('Failed to list attendance records', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error listing attendance records');
    }
  },
});

export const teamsListMeetingRecordings = tool({
  description: 'List recordings of an online meeting.',
  inputSchema: z.object({
    teamsToken: tokenField,
    meetingId: z.string().describe('Online meeting ID'),
  }),
  execute: async ({ teamsToken, meetingId }) => {
    try {
      const result = await graphRequest(teamsToken, `/me/onlineMeetings/${meetingId}/recordings`);
      if (!result.ok) return failedResult('Failed to list meeting recordings', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error listing meeting recordings');
    }
  },
});

export const teamsGetMeetingRecording = tool({
  description: 'Get one meeting recording metadata (creator, dates, storage location).',
  inputSchema: z.object({
    teamsToken: tokenField,
    meetingId: z.string().describe('Online meeting ID'),
    recordingId: z.string().describe('Recording ID'),
  }),
  execute: async ({ teamsToken, meetingId, recordingId }) => {
    try {
      const result = await graphRequest(
        teamsToken,
        `/me/onlineMeetings/${meetingId}/recordings/${recordingId}`,
      );
      if (!result.ok) return failedResult('Failed to get meeting recording', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error getting meeting recording');
    }
  },
});

export const teamsGetPresence = tool({
  description: 'Get availability/activity presence of the user or another user.',
  inputSchema: z.object({
    teamsToken: tokenField,
    userId: z.string().optional().describe('User ID or UPN (omit for signed-in user)'),
  }),
  execute: async ({ teamsToken, userId }) => {
    try {
      const path = userId !== undefined ? `/users/${userId}/presence` : '/me/presence';
      const result = await graphRequest(teamsToken, path);
      if (!result.ok) return failedResult('Failed to get presence', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error getting presence');
    }
  },
});

export const teamsSetPresence = tool({
  description:
    'Set user presence (Available, Busy, DoNotDisturb, Away, ...) with optional expiry. Use for status automation.',
  inputSchema: z.object({
    teamsToken: tokenField,
    availability: z
      .string()
      .describe('Availability, e.g. Available, Busy, DoNotDisturb, Away, Offline'),
    activity: z.string().describe('Activity, e.g. Available, InACall, InAMeeting, Busy, Away'),
    expirationMinutes: z.number().int().min(1).optional().describe('Expire after N minutes'),
  }),
  execute: async ({ teamsToken, availability, activity, expirationMinutes }) => {
    try {
      const result = await graphRequest(teamsToken, '/me/presence/setPresence', {
        method: 'POST',
        body: {
          sessionId: 'runstack-teams-toolkit',
          availability,
          activity,
          ...(expirationMinutes !== undefined
            ? { expirationDuration: `PT${expirationMinutes}M` }
            : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to set presence', result);
      return result.data ?? { set: true };
    } catch (error) {
      return toTeamsError(error, 'Error setting presence');
    }
  },
});
