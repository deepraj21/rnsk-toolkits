// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dribRaw } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const dribbbleGetCurrentUser = tool({
  description:
    "Return the connected Dribbble user's profile, account capabilities and teams. Pass a previously returned ETag or Last-Modified value to get a cheap 304 not-modified confirmation.",
  inputSchema: z.object({
    dribbbleToken: tokenField,
    ifNoneMatch: z
      .string()
      .optional()
      .describe('Previously returned ETag. Dribbble returns 304 when the user is unchanged.'),
    ifModifiedSince: z
      .string()
      .optional()
      .describe(
        'Previously returned Last-Modified HTTP date. Dribbble returns 304 when unchanged.',
      ),
  }),
  execute: async ({ dribbbleToken, ifNoneMatch, ifModifiedSince }) => {
    if (!dribbbleToken) return { error: 'Dribbble token is required. Connect Dribbble first.' };
    const headers: Record<string, string> = {};
    if (ifNoneMatch !== undefined) headers['If-None-Match'] = ifNoneMatch;
    if (ifModifiedSince !== undefined) headers['If-Modified-Since'] = ifModifiedSince;
    const res = await dribRaw(dribbbleToken, 'GET', '/user', { headers });
    if (res && typeof res === 'object' && 'error' in res && !('status' in res)) return res;
    const {
      status,
      headers: resHeaders,
      data,
    } = res as {
      status: number;
      headers: Headers;
      data: unknown;
    };
    if (status === 304) {
      return {
        not_modified: true,
        etag: resHeaders.get('etag'),
        last_modified: resHeaders.get('last-modified'),
      };
    }
    if (status >= 400) return { error: `Dribbble API error ${status}`, details: data };
    return {
      ...(data as Record<string, unknown>),
      not_modified: false,
      etag: resHeaders.get('etag'),
      last_modified: resHeaders.get('last-modified'),
    };
  },
});
