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

export const twilioListMessages = tool({
  description: 'List SMS/MMS messages for the account with optional To/From/date filters.',
  inputSchema: z.object({
    twilioCredentials: credField,
    to: z.string().optional().describe('Filter by recipient E.164'),
    from: z.string().optional().describe('Filter by sender E.164'),
    dateSent: z.string().optional().describe('Filter by date sent (YYYY-MM-DD)'),
    pageSize: z.number().int().max(1000).optional(),
    page: z.number().int().optional(),
  }),
  execute: async ({ twilioCredentials, to, from, dateSent, pageSize, page }) => {
    try {
      const creds = parseTwilioCredentials(twilioCredentials);
      const result = await twilioRequest(twilioCredentials, accountPath(creds, '/Messages.json'), {
        query: { To: to, From: from, DateSent: dateSent, PageSize: pageSize, Page: page },
      });
      if (!result.ok) return failedResult('Failed to list messages', result);
      return result.data;
    } catch (error) {
      return toTwilioError(error, 'Error listing messages');
    }
  },
});

export const twilioGetMessage = tool({
  description: 'Get one message by SID (GET /Messages/{MessageSid}.json).',
  inputSchema: z.object({
    twilioCredentials: credField,
    messageSid: z.string().describe('Message SID (SM...)'),
  }),
  execute: async ({ twilioCredentials, messageSid }) => {
    try {
      const creds = parseTwilioCredentials(twilioCredentials);
      const result = await twilioRequest(
        twilioCredentials,
        accountPath(creds, `/Messages/${encodeURIComponent(messageSid)}.json`),
      );
      if (!result.ok) return failedResult('Failed to get message', result);
      return result.data;
    } catch (error) {
      return toTwilioError(error, 'Error getting message');
    }
  },
});

export const twilioSendMessage = tool({
  description:
    'Send an SMS or MMS (POST /Messages.json). Requires approved From number or messaging service.',
  inputSchema: z.object({
    twilioCredentials: credField,
    to: z.string().describe('Recipient E.164, e.g. +15551234567'),
    from: z.string().optional().describe('Twilio phone number E.164'),
    messagingServiceSid: z
      .string()
      .optional()
      .describe('Messaging Service SID (MG...) instead of from'),
    body: z.string().optional().describe('Message body text'),
    mediaUrl: z.array(z.string().url()).optional().describe('MMS media URLs'),
    statusCallback: z.string().url().optional().describe('Webhook for delivery status'),
  }),
  execute: async ({
    twilioCredentials,
    to,
    from,
    messagingServiceSid,
    body,
    mediaUrl,
    statusCallback,
  }) => {
    try {
      const creds = parseTwilioCredentials(twilioCredentials);
      const form: Record<string, string | undefined> = { To: to };
      if (from !== undefined) form.From = from;
      if (messagingServiceSid !== undefined) form.MessagingServiceSid = messagingServiceSid;
      if (body !== undefined) form.Body = body;
      if (statusCallback !== undefined) form.StatusCallback = statusCallback;
      if (mediaUrl?.length) {
        mediaUrl.forEach((url, i) => {
          form[`MediaUrl.${i}`] = url;
        });
      }
      const result = await twilioRequest(twilioCredentials, accountPath(creds, '/Messages.json'), {
        method: 'POST',
        body: form,
      });
      if (!result.ok) return failedResult('Failed to send message', result);
      return result.data;
    } catch (error) {
      return toTwilioError(error, 'Error sending message');
    }
  },
});

export const twilioDeleteMessage = tool({
  description: 'Delete a message record by SID (DELETE /Messages/{MessageSid}.json).',
  inputSchema: z.object({
    twilioCredentials: credField,
    messageSid: z.string().describe('Message SID'),
  }),
  execute: async ({ twilioCredentials, messageSid }) => {
    try {
      const creds = parseTwilioCredentials(twilioCredentials);
      const result = await twilioRequest(
        twilioCredentials,
        accountPath(creds, `/Messages/${encodeURIComponent(messageSid)}.json`),
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete message', result);
      return result.data ?? { deleted: true, messageSid };
    } catch (error) {
      return toTwilioError(error, 'Error deleting message');
    }
  },
});
