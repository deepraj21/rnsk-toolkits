// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
  whatsappRequest,
  failedResult,
  toWhatsAppError,
  resolveWabaHelper,
  parseWhatsAppCredentials,
} from './client.js';

export const whatsappGetBusinessAccountDetails = tool({
  description: 'Get WABA review status, verification, timezone, and ownership.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    wabaId: z.string().optional().describe('WABA ID; defaults to the credentials wabaId'),
    fields: z.string().optional(),
  }),
  execute: async ({ whatsappCredentials, wabaId, fields }) => {
    try {
      const wabaResolved = resolveWabaHelper(
        whatsappCredentials,
        typeof wabaId !== 'undefined' ? wabaId : undefined,
      );
      if (!wabaResolved.id) return wabaResolved.error;
      const wabaIdResolved = wabaResolved.id;
      const result = await whatsappRequest(whatsappCredentials, `/${waba}`, {
        method: 'GET',
        query: { fields },
      });
      if (!result.ok) return failedResult('Failed to get business account details', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error getting business account details');
    }
  },
});

export const whatsappGetActivities = tool({
  description: 'Audit admin actions like verifications and user additions.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    wabaId: z.string().optional().describe('WABA ID; defaults to the credentials wabaId'),
    after: z.string().optional(),
    limit: z.number().int().optional().describe('max 100'),
    since: z.string().optional().describe('unix or ISO'),
    until: z.string().optional(),
    before: z.string().optional(),
    fields: z.string().optional(),
    activityType: z.string().optional().describe('e.g. PHONE_NUMBER_VERIFIED'),
  }),
  execute: async ({
    whatsappCredentials,
    wabaId,
    after,
    limit,
    since,
    until,
    before,
    fields,
    activityType,
  }) => {
    try {
      const wabaResolved = resolveWabaHelper(
        whatsappCredentials,
        typeof wabaId !== 'undefined' ? wabaId : undefined,
      );
      if (!wabaResolved.id) return wabaResolved.error;
      const wabaIdResolved = wabaResolved.id;
      const result = await whatsappRequest(whatsappCredentials, `/${wabaIdResolved}/activities`, {
        method: 'GET',
        query: { after, limit, since, until, before, fields, activityType },
      });
      if (!result.ok) return failedResult('Failed to get activities', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error getting activities');
    }
  },
});

export const whatsappGetSubscribedApps = tool({
  description: 'List apps subscribed to WABA webhooks.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    wabaId: z.string().optional().describe('WABA ID; defaults to the credentials wabaId'),
    fields: z.string().optional().describe('id,name,link'),
  }),
  execute: async ({ whatsappCredentials, wabaId, fields }) => {
    try {
      const wabaResolved = resolveWabaHelper(
        whatsappCredentials,
        typeof wabaId !== 'undefined' ? wabaId : undefined,
      );
      if (!wabaResolved.id) return wabaResolved.error;
      const wabaIdResolved = wabaResolved.id;
      const result = await whatsappRequest(
        whatsappCredentials,
        `/${wabaIdResolved}/subscribed_apps`,
        { method: 'GET', query: { fields } },
      );
      if (!result.ok) return failedResult('Failed to get subscribed apps', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error getting subscribed apps');
    }
  },
});

export const whatsappSubscribeApp = tool({
  description: 'Subscribe your app to WABA webhooks with callback URL and verify token.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    wabaId: z.string().optional().describe('WABA ID; defaults to the credentials wabaId'),
    overrideCallbackUri: z.string().optional().describe('https webhook URL'),
    verifyToken: z.string().optional(),
  }),
  execute: async ({ whatsappCredentials, wabaId, overrideCallbackUri, verifyToken }) => {
    try {
      const wabaResolved = resolveWabaHelper(
        whatsappCredentials,
        typeof wabaId !== 'undefined' ? wabaId : undefined,
      );
      if (!wabaResolved.id) return wabaResolved.error;
      const wabaIdResolved = wabaResolved.id;
      const result = await whatsappRequest(
        whatsappCredentials,
        `/${wabaIdResolved}/subscribed_apps`,
        { method: 'POST', body: { overrideCallbackUri, verifyToken } },
      );
      if (!result.ok) return failedResult('Failed to subscribe app', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error subscribing app');
    }
  },
});

export const whatsappUnsubscribeApp = tool({
  description: 'Stop webhook delivery for your app. Irreversible without resubscribing.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    wabaId: z.string().optional().describe('WABA ID; defaults to the credentials wabaId'),
  }),
  execute: async ({ whatsappCredentials, wabaId }) => {
    try {
      const wabaResolved = resolveWabaHelper(
        whatsappCredentials,
        typeof wabaId !== 'undefined' ? wabaId : undefined,
      );
      if (!wabaResolved.id) return wabaResolved.error;
      const wabaIdResolved = wabaResolved.id;
      const result = await whatsappRequest(
        whatsappCredentials,
        `/${wabaIdResolved}/subscribed_apps`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to unsubscribe app', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error unsubscribing app');
    }
  },
});

export const whatsappRemoveAssignedUser = tool({
  description: 'Revoke a user access from the WABA immediately. Irreversible.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    wabaId: z.string().optional().describe('WABA ID; defaults to the credentials wabaId'),
    user: z.string().describe('Facebook user ID'),
  }),
  execute: async ({ whatsappCredentials, wabaId, user }) => {
    try {
      const wabaResolved = resolveWabaHelper(
        whatsappCredentials,
        typeof wabaId !== 'undefined' ? wabaId : undefined,
      );
      if (!wabaResolved.id) return wabaResolved.error;
      const wabaIdResolved = wabaResolved.id;
      const result = await whatsappRequest(
        whatsappCredentials,
        `/${wabaIdResolved}/assigned_users`,
        { method: 'DELETE', query: { user } },
      );
      if (!result.ok) return failedResult('Failed to remove assigned user', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error removing assigned user');
    }
  },
});

export const whatsappGetOwnedAccounts = tool({
  description: 'List WABAs directly owned by a business portfolio.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    businessId: z.string(),
    find: z.string().optional().describe('account ID'),
    last: z.number().int().optional().describe('max 100'),
    after: z.string().optional(),
    first: z.number().int().optional().describe('max 100'),
    before: z.string().optional(),
    fields: z.string().optional(),
    businessType: z.array(z.string()).optional().describe('ENTERPRISE and/or SMB'),
  }),
  execute: async ({
    whatsappCredentials,
    businessId,
    find,
    last,
    after,
    first,
    before,
    fields,
    businessType,
  }) => {
    try {
      const result = await whatsappRequest(
        whatsappCredentials,
        `/${businessId}/owned_whatsapp_business_accounts`,
        {
          method: 'GET',
          query: { find, last, after, first, before, fields, business_type: businessType },
        },
      );
      if (!result.ok) return failedResult('Failed to get owned accounts', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error getting owned accounts');
    }
  },
});

export const whatsappGetClientAccounts = tool({
  description: 'List client WABAs shared with a business portfolio. For agencies.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    businessId: z.string(),
    find: z.string().optional(),
    after: z.string().optional(),
    limit: z.number().int().optional().describe('max 100'),
    before: z.string().optional(),
    fields: z.string().optional(),
    businessType: z.array(z.string()).optional().describe('STANDARD and/or PREMIUM'),
  }),
  execute: async ({
    whatsappCredentials,
    businessId,
    find,
    after,
    limit,
    before,
    fields,
    businessType,
  }) => {
    try {
      const result = await whatsappRequest(
        whatsappCredentials,
        `/${businessId}/client_whatsapp_business_accounts`,
        {
          method: 'GET',
          query: { find, after, limit, before, fields, business_type: businessType },
        },
      );
      if (!result.ok) return failedResult('Failed to get client accounts', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error getting client accounts');
    }
  },
});

export const whatsappGetSchedules = tool({
  description: 'List campaign schedules with status and recurrence.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    wabaId: z.string().optional().describe('WABA ID; defaults to the credentials wabaId'),
    sort: z.string().optional().describe('created_time/updated_time asc/desc'),
    after: z.string().optional(),
    limit: z.number().int().optional().describe('max 100'),
    before: z.string().optional(),
    fields: z.string().optional(),
    filtering: z.string().optional().describe('JSON filter array'),
  }),
  execute: async ({
    whatsappCredentials,
    wabaId,
    sort,
    after,
    limit,
    before,
    fields,
    filtering,
  }) => {
    try {
      const wabaResolved = resolveWabaHelper(
        whatsappCredentials,
        typeof wabaId !== 'undefined' ? wabaId : undefined,
      );
      if (!wabaResolved.id) return wabaResolved.error;
      const wabaIdResolved = wabaResolved.id;
      const result = await whatsappRequest(whatsappCredentials, `/${wabaIdResolved}/schedules`, {
        method: 'GET',
        query: { sort, after, limit, before, fields, filtering },
      });
      if (!result.ok) return failedResult('Failed to get schedules', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error getting schedules');
    }
  },
});

export const whatsappGetSolutions = tool({
  description: 'List multi-partner solutions linked to the WABA.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    wabaId: z.string().optional().describe('WABA ID; defaults to the credentials wabaId'),
    after: z.string().optional(),
    limit: z.number().int().optional().describe('max 100'),
    before: z.string().optional(),
    fields: z.string().optional(),
  }),
  execute: async ({ whatsappCredentials, wabaId, after, limit, before, fields }) => {
    try {
      const wabaResolved = resolveWabaHelper(
        whatsappCredentials,
        typeof wabaId !== 'undefined' ? wabaId : undefined,
      );
      if (!wabaResolved.id) return wabaResolved.error;
      const wabaIdResolved = wabaResolved.id;
      const result = await whatsappRequest(whatsappCredentials, `/${wabaIdResolved}/solutions`, {
        method: 'GET',
        query: { after, limit, before, fields },
      });
      if (!result.ok) return failedResult('Failed to get solutions', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error getting solutions');
    }
  },
});

export const whatsappCreateMaxPriceAgreement = tool({
  description:
    'Sign the max-price beta agreement for a business. Per-message ceilings live on templates.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    businessId: z.string().describe('Meta Business Suite ID'),
    signerName: z.string(),
    signerEmail: z.string().describe('receives acceptance link'),
  }),
  execute: async ({ whatsappCredentials, businessId, signerName, signerEmail }) => {
    try {
      const result = await whatsappRequest(
        whatsappCredentials,
        `/${businessId}/max_price_agreements`,
        { method: 'POST', body: { signer_name: signerName, signer_email: signerEmail } },
      );
      if (!result.ok) return failedResult('Failed to create max price agreement', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error creating max price agreement');
    }
  },
});

export const whatsappWhoAmI = tool({
  description: 'Return the connected Meta account id and name.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
  }),
  execute: async ({ whatsappCredentials }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, '/me', { method: 'GET' });
      if (!result.ok) return failedResult('Failed to identify WhatsApp account', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error identifying WhatsApp account');
    }
  },
});
