// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformGetTheme = tool({
  description:
    'Gets the full definition of one theme — colors, background, fonts, and field styles. Use this before updating a theme. Needs the themes:read scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    themeId: z.string().min(1).describe('Theme ID'),
  }),
  execute: async ({ typeformToken, themeId }) => {
    if (!themeId) return { error: 'themeId is required.' };

    const result = await typeformRequest(typeformToken, `/themes/${encodeURIComponent(themeId)}`);
    if (result.error) return result;

    return result.data ?? {};
  },
});
