// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxRpc } from './client.js';

export const dropboxGetCurrentAccount = tool({
  description:
    'Gets the account behind the connected Dropbox token — account id, display name, email, locale, and profile photo. Use the account id when a member selector needs a Dropbox id.',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
  }),
  execute: async ({ dropboxToken }) => {
    const result = await dropboxRpc(dropboxToken, '/users/get_current_account', {});
    if (result.error) return result;

    return result.data;
  },
});
