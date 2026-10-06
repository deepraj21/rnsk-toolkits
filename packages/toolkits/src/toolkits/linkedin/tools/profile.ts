// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { linkedInRequest, missingToken, toLinkedInError } from './client.js';

const authField = {
  linkedinToken: z.string().optional().describe('Injected by system; do not provide'),
};

export const linkedinGetMyInfo = tool({
  description:
    'Get the authenticated member profile: name, email, locale, picture, and subject ID. Call first to resolve your person URN (urn:li:person:{sub}) for authoring posts and comments.',
  inputSchema: z.object({
    ...authField,
  }),
  execute: async ({ linkedinToken }) => {
    try {
      if (!linkedinToken) return missingToken();
      return await linkedInRequest(linkedinToken, '/v2/userinfo');
    } catch (error) {
      return toLinkedInError(error, 'Failed to get my info');
    }
  },
});

export const linkedinWhoAmI = tool({
  description:
    'Identify the connected LinkedIn account: name, email, member ID, and person URN. Lightweight identity check before acting on behalf of the account.',
  inputSchema: z.object({
    ...authField,
  }),
  execute: async ({ linkedinToken }) => {
    try {
      if (!linkedinToken) return missingToken();
      const info: any = await linkedInRequest(linkedinToken, '/v2/userinfo');
      return {
        name: info?.name,
        givenName: info?.given_name,
        familyName: info?.family_name,
        email: info?.email,
        emailVerified: info?.email_verified,
        locale: info?.locale,
        picture: info?.picture,
        memberId: info?.sub,
        personUrn: info?.sub ? `urn:li:person:${info.sub}` : undefined,
      };
    } catch (error) {
      return toLinkedInError(error, 'Failed to identify account');
    }
  },
});

export const linkedinGetPerson = tool({
  description:
    'Look up a LinkedIn member lite profile (names, picture) by person ID. Use for resolving comment authors or mention targets.',
  inputSchema: z.object({
    ...authField,
    personId: z
      .string()
      .describe(
        'Member ID (app-scoped). For your own ID, call linkedinGetMyInfo and use the sub value',
      ),
  }),
  execute: async ({ linkedinToken, personId }) => {
    try {
      if (!linkedinToken) return missingToken();
      const id = personId.trim();
      return await linkedInRequest(linkedinToken, `/v2/people/(id:${encodeURIComponent(id)})`, {
        query: {
          projection:
            '(id,localizedFirstName,localizedLastName,firstName,lastName,profilePicture(displayImage~:playableStreams))',
        },
      });
    } catch (error) {
      return toLinkedInError(error, 'Failed to get person');
    }
  },
});
