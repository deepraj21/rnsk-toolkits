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

export const twilioGetAccount = tool({
  description: 'Get the Twilio account resource (GET /Accounts/{AccountSid}.json).',
  inputSchema: z.object({ twilioCredentials: credField }),
  execute: async ({ twilioCredentials }) => {
    try {
      const creds = parseTwilioCredentials(twilioCredentials);
      const result = await twilioRequest(twilioCredentials, accountPath(creds, '.json'));
      if (!result.ok) return failedResult('Failed to get account', result);
      return result.data;
    } catch (error) {
      return toTwilioError(error, 'Error getting account');
    }
  },
});

export const twilioListIncomingPhoneNumbers = tool({
  description: 'List incoming phone numbers on the account.',
  inputSchema: z.object({
    twilioCredentials: credField,
    phoneNumber: z.string().optional().describe('Filter by E.164'),
    pageSize: z.number().int().optional(),
  }),
  execute: async ({ twilioCredentials, phoneNumber, pageSize }) => {
    try {
      const creds = parseTwilioCredentials(twilioCredentials);
      const result = await twilioRequest(
        twilioCredentials,
        accountPath(creds, '/IncomingPhoneNumbers.json'),
        { query: { PhoneNumber: phoneNumber, PageSize: pageSize } },
      );
      if (!result.ok) return failedResult('Failed to list phone numbers', result);
      return result.data;
    } catch (error) {
      return toTwilioError(error, 'Error listing phone numbers');
    }
  },
});

export const twilioLookupPhoneNumber = tool({
  description: 'Look up a phone number (line type, carrier) via Lookups API v2.',
  inputSchema: z.object({
    twilioCredentials: credField,
    phoneNumber: z.string().describe('E.164 phone number to lookup'),
    fields: z.string().optional().describe('Optional fields, e.g. line_type_intelligence'),
  }),
  execute: async ({ twilioCredentials, phoneNumber, fields }) => {
    try {
      const encoded = encodeURIComponent(phoneNumber);
      const result = await twilioRequest(twilioCredentials, `/v2/PhoneNumbers/${encoded}`, {
        query: fields ? { Fields: fields } : undefined,
        baseHost: 'https://lookups.twilio.com',
      });
      if (!result.ok) return failedResult('Failed to lookup phone number', result);
      return result.data;
    } catch (error) {
      return toTwilioError(error, 'Error looking up phone number');
    }
  },
});
