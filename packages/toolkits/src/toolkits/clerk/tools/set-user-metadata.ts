// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { clerkRequest, compact } from './client.js';

export const clerkSetUserMetadata = tool({
  description:
    'Merges metadata into a Clerk user (PATCH metadata). Provided keys are merged over existing values — other keys stay. publicMetadata is readable from the client; privateMetadata is server-only; unsafeMetadata is client-writable until locked. Use to store app-level flags, plans, or external records.',
  inputSchema: z.object({
    clerkToken: z.string().optional().describe('Clerk secret key (injected by system)'),
    userId: z.string().describe('User ID'),
    publicMetadata: z
      .record(z.any())
      .optional()
      .describe('Public metadata keys to merge (readable client-side)'),
    privateMetadata: z
      .record(z.any())
      .optional()
      .describe('Private metadata keys to merge (server-only)'),
    unsafeMetadata: z
      .record(z.any())
      .optional()
      .describe('Unsafe metadata keys to merge (client-writable)'),
  }),
  execute: async ({ clerkToken, userId, publicMetadata, privateMetadata, unsafeMetadata }) => {
    const body = compact({
      public_metadata: publicMetadata,
      private_metadata: privateMetadata,
      unsafe_metadata: unsafeMetadata,
    });

    if (Object.keys(body).length === 0) {
      return {
        error:
          'Provide at least one metadata object: publicMetadata, privateMetadata, or unsafeMetadata.',
      };
    }

    const result = await clerkRequest(clerkToken, `/users/${userId}/metadata`, {
      method: 'PATCH',
      body,
    });
    if (result.error) return result;
    return result.data;
  },
});
