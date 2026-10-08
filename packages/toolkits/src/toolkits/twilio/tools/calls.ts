// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
  twilioRequest,
  parseTwilioCredentials,
  accountPath,
  failedResult,
  toTwilioError,
} from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const twilioListCalls = tool({
  description: 'List voice calls with optional To/From/status filters.',
  inputSchema: z.object({
    twilioCredentials: credField,
    to: z.string().optional(),
    from: z.string().optional(),
    status: z
      .enum([
        'queued',
        'ringing',
        'in-progress',
        'completed',
        'busy',
        'failed',
        'no-answer',
        'canceled',
      ])
      .optional(),
    pageSize: z.number().int().optional(),
    page: z.number().int().optional(),
  }),
  execute: async ({ twilioCredentials, to, from, status, pageSize, page }) => {
    try {
      const creds = parseTwilioCredentials(twilioCredentials);
      const result = await twilioRequest(twilioCredentials, accountPath(creds, '/Calls.json'), {
        query: { To: to, From: from, Status: status, PageSize: pageSize, Page: page },
      });
      if (!result.ok) return failedResult('Failed to list calls', result);
      return result.data;
    } catch (error) {
      return toTwilioError(error, 'Error listing calls');
    }
  },
});

export const twilioGetCall = tool({
  description: 'Get a call by SID.',
  inputSchema: z.object({
    twilioCredentials: credField,
    callSid: z.string().describe('Call SID (CA...)'),
  }),
  execute: async ({ twilioCredentials, callSid }) => {
    try {
      const creds = parseTwilioCredentials(twilioCredentials);
      const result = await twilioRequest(
        twilioCredentials,
        accountPath(creds, `/Calls/${encodeURIComponent(callSid)}.json`),
      );
      if (!result.ok) return failedResult('Failed to get call', result);
      return result.data;
    } catch (error) {
      return toTwilioError(error, 'Error getting call');
    }
  },
});

export const twilioCreateCall = tool({
  description: 'Initiate an outbound call (POST /Calls.json) with TwiML URL or inline TwiML.',
  inputSchema: z.object({
    twilioCredentials: credField,
    to: z.string().describe('Callee E.164'),
    from: z.string().describe('Caller Twilio number E.164'),
    url: z.string().url().optional().describe('TwiML URL executed when call connects'),
    twiml: z.string().optional().describe('Inline TwiML (use instead of url)'),
    statusCallback: z.string().url().optional(),
  }),
  execute: async ({ twilioCredentials, to, from, url, twiml, statusCallback }) => {
    try {
      const creds = parseTwilioCredentials(twilioCredentials);
      const body: Record<string, string | undefined> = { To: to, From: from };
      if (url !== undefined) body.Url = url;
      if (twiml !== undefined) body.Twiml = twiml;
      if (statusCallback !== undefined) body.StatusCallback = statusCallback;
      const result = await twilioRequest(twilioCredentials, accountPath(creds, '/Calls.json'), {
        method: 'POST',
        body,
      });
      if (!result.ok) return failedResult('Failed to create call', result);
      return result.data;
    } catch (error) {
      return toTwilioError(error, 'Error creating call');
    }
  },
});
