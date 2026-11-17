// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformDeleteTheme = tool({
  description:
    'Deletes a theme from the account. Forms using it keep their applied copy; only the saved theme is removed. Confirm with the user first. Needs the themes:write scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    themeId: z.string().min(1).describe('Theme ID to delete'),
  }),
  execute: async ({ typeformToken, themeId }) => {
    if (!themeId) return { error: 'themeId is required.' };

    const result = await typeformRequest(typeformToken, `/themes/${encodeURIComponent(themeId)}`, {
      method: 'DELETE',
    });
    if (result.error) return result;

    return { deleted: true, status: result.status, data: result.data ?? null };
  },
});
