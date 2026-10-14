// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { resendRequest, failedResult, toResendError } from './client.js';

const keyField = z.string().optional().describe('Injected by system; do not provide');

export const resendCreateAudience = tool({
  description: 'Create an audience list for marketing contacts (POST /audiences).',
  inputSchema: z.object({
    resendApiKey: keyField,
    name: z.string(),
  }),
  execute: async ({ resendApiKey, name }) => {
    try {
      const result = await resendRequest(resendApiKey, '/audiences', {
        method: 'POST',
        body: { name },
      });
      if (!result.ok) return failedResult('Failed to create audience', result);
      return result.data;
    } catch (error) {
      return toResendError(error, 'Error creating audience');
    }
  },
});

export const resendListAudiences = tool({
  description: 'List audiences (GET /audiences).',
  inputSchema: z.object({
    resendApiKey: keyField,
  }),
  execute: async ({ resendApiKey }) => {
    try {
      const result = await resendRequest(resendApiKey, '/audiences');
      if (!result.ok) return failedResult('Failed to list audiences', result);
      return result.data;
    } catch (error) {
      return toResendError(error, 'Error listing audiences');
    }
  },
});

export const resendCreateContact = tool({
  description: 'Add a contact to an audience (POST /audiences/{audienceId}/contacts).',
  inputSchema: z.object({
    resendApiKey: keyField,
    audienceId: z.string(),
    email: z.string().email(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    unsubscribed: z.boolean().optional(),
  }),
  execute: async ({ resendApiKey, audienceId, email, firstName, lastName, unsubscribed }) => {
    try {
      const body: Record<string, unknown> = { email };
      if (firstName) body.first_name = firstName;
      if (lastName) body.last_name = lastName;
      if (unsubscribed !== undefined) body.unsubscribed = unsubscribed;
      const result = await resendRequest(
        resendApiKey,
        `/audiences/${encodeURIComponent(audienceId)}/contacts`,
        { method: 'POST', body },
      );
      if (!result.ok) return failedResult('Failed to create contact', result);
      return result.data;
    } catch (error) {
      return toResendError(error, 'Error creating contact');
    }
  },
});
