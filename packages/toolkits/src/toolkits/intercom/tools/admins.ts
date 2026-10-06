// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { intercomRequest, failedResult, toIntercomError } from './client.js';

export const intercomIdentifyAdmin = tool({
  description: 'Identify the authorized admin and workspace. Start here to resolve IDs.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
  }),
  execute: async ({ intercomCredentials }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/me`, { method: 'GET' });
      if (!result.ok) return failedResult('Failed to identify admin', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error identifying admin');
    }
  },
});

export const intercomListAdmins = tool({
  description: 'Fetch teammates with inbox seats, away state, and teams.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    displayAvatar: z.boolean().optional().describe('include avatar URLs'),
  }),
  execute: async ({ intercomCredentials, displayAvatar }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/admins`, {
        method: 'GET',
        query: { displayAvatar: displayAvatar },
      });
      if (!result.ok) return failedResult('Failed to list admins', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing admins');
    }
  },
});

export const intercomRetrieveAdmin = tool({
  description: 'Fetch a single admin by ID.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    id: z.number().int(),
  }),
  execute: async ({ intercomCredentials, id }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/admins/${id}`, { method: 'GET' });
      if (!result.ok) return failedResult('Failed to retrieve admin', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error retrieving admin');
    }
  },
});

export const intercomSetAdminAway = tool({
  description: 'Set an admin away, optionally reassigning new replies and giving a reason.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    adminId: z.number().int(),
    awayModeEnabled: z.boolean().describe('true for away'),
    awayModeReassign: z.boolean().optional().describe('route to default inbox'),
    awayStatusReasonId: z.number().int().optional(),
  }),
  execute: async ({
    intercomCredentials,
    adminId,
    awayModeEnabled,
    awayModeReassign,
    awayStatusReasonId,
  }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/admins/${adminId}/away`, {
        method: 'PUT',
        body: { awayModeEnabled, awayModeReassign, awayStatusReasonId },
      });
      if (!result.ok) return failedResult('Failed to set admin away', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error setting admin away');
    }
  },
});

export const intercomSetAnAdminAway = tool({
  description: 'Set an admin away for the inbox with reassignment control.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    id: z.number().int(),
    awayModeEnabled: z.boolean().describe('true for away'),
    awayModeReassign: z.boolean().optional().describe('route to default inbox'),
  }),
  execute: async ({ intercomCredentials, id, awayModeEnabled, awayModeReassign }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/admins/${id}/away`, {
        method: 'PUT',
        body: { awayModeEnabled, awayModeReassign },
      });
      if (!result.ok) return failedResult('Failed to set an admin away', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error setting an admin away');
    }
  },
});

export const intercomListActivityLogs = tool({
  description: 'Audit log of admin actions in a time window.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    createdAtAfter: z.string().describe('unix seconds start'),
    createdAtBefore: z.string().optional().describe('unix seconds end'),
  }),
  execute: async ({ intercomCredentials, createdAtAfter, createdAtBefore }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/admins/activity_logs`, {
        method: 'GET',
        query: { createdAtAfter: createdAtAfter, createdAtBefore: createdAtBefore },
      });
      if (!result.ok) return failedResult('Failed to list activity logs', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing activity logs');
    }
  },
});

export const intercomListAwayStatusReasons = tool({
  description: 'List away status reasons including deleted ones.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
  }),
  execute: async ({ intercomCredentials }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/away_status_reasons`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to list away status reasons', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing away status reasons');
    }
  },
});

export const intercomListTeams = tool({
  description: 'List teams with members and assignment config.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
  }),
  execute: async ({ intercomCredentials }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/teams`, { method: 'GET' });
      if (!result.ok) return failedResult('Failed to list teams', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing teams');
    }
  },
});

export const intercomRetrieveTeam = tool({
  description: 'Fetch a single team by ID.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    teamId: z.string(),
  }),
  execute: async ({ intercomCredentials, teamId }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/teams/${teamId}`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to retrieve team', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error retrieving team');
    }
  },
});

export const intercomListMacros = tool({
  description: 'List saved replies (macros), newest first, with cursor pagination.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    perPage: z.number().int().optional().describe('1-150'),
    startingAfter: z.string().optional().describe('base64 [updated_at,id] cursor'),
    updatedSince: z.number().int().optional().describe('unix seconds filter'),
  }),
  execute: async ({ intercomCredentials, perPage, startingAfter, updatedSince }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/macros`, {
        method: 'GET',
        query: { perPage: perPage, startingAfter: startingAfter, updatedSince: updatedSince },
      });
      if (!result.ok) return failedResult('Failed to list macros', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing macros');
    }
  },
});

export const intercomRetrieveMacro = tool({
  description: 'Fetch a single saved reply by ID when visible to you.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    id: z.string(),
  }),
  execute: async ({ intercomCredentials, id }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/macros/${id}`, { method: 'GET' });
      if (!result.ok) return failedResult('Failed to retrieve macro', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error retrieving macro');
    }
  },
});

export const intercomListCalls = tool({
  description: 'List phone calls with pagination.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    page: z.number().int().optional(),
    perPage: z.number().int().optional().describe('max 25'),
  }),
  execute: async ({ intercomCredentials, page, perPage }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/calls`, {
        method: 'GET',
        query: { page: page, perPage: perPage },
      });
      if (!result.ok) return failedResult('Failed to list calls', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing calls');
    }
  },
});

export const intercomListCallsWithTranscripts = tool({
  description: 'Fetch calls with transcripts for up to 20 conversations.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    conversationIds: z.array(z.string()).describe('1-20 conversation IDs'),
  }),
  execute: async ({ intercomCredentials, conversationIds }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/calls/search`, {
        method: 'POST',
        body: { conversationIds },
      });
      if (!result.ok) return failedResult('Failed to list calls with transcripts', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing calls with transcripts');
    }
  },
});

export const intercomShowCall = tool({
  description: 'Fetch a single call with recording and transcript URLs.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    callId: z.string(),
  }),
  execute: async ({ intercomCredentials, callId }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/calls/${callId}`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to show call', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error showing call');
    }
  },
});

export const intercomShowCallTranscript = tool({
  description: 'Get a call transcript as text. Long transcripts are truncated.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    callId: z.string(),
  }),
  execute: async ({ intercomCredentials, callId }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/calls/${callId}/transcript`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to get call transcript', result);
      const text = typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
      const LIMIT = 100000;
      return text.length > LIMIT
        ? { transcript: `${text.slice(0, LIMIT)}... (truncated)`, truncated: true }
        : { transcript: text, truncated: false };
    } catch (error) {
      return toIntercomError(error, 'Error getting call transcript');
    }
  },
});

export const intercomRegisterFinVoiceCall = tool({
  description: 'Register an external voice call for Fin analysis and tracking.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    phoneNumber: z.string().describe('E.164 format'),
    callId: z.string().describe('provider call ID'),
    source: z.string().optional().describe('five9, zoom_phone, or aws_connect'),
    data: z.record(z.any()).optional().describe('custom metadata'),
  }),
  execute: async ({ intercomCredentials, phoneNumber, callId, source, data }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/fin_voice/register`, {
        method: 'POST',
        body: { phoneNumber, callId, source, data },
      });
      if (!result.ok) return failedResult('Failed to register fin voice call', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error register fin voice call');
    }
  },
});
