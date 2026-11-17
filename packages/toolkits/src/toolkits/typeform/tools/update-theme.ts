// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformUpdateTheme = tool({
  description:
    'Replaces the whole definition of a theme (colors, background, fonts, field styles) — sections you omit are cleared. For small changes prefer typeformPatchTheme. Needs the themes:write scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    themeId: z.string().min(1).describe('Theme ID to replace'),
    theme: z
      .record(z.any())
      .describe('Complete new theme definition — colors, background, fonts, fields'),
  }),
  execute: async ({ typeformToken, themeId, theme }) => {
    if (!themeId) return { error: 'themeId is required.' };
    if (!theme || typeof theme !== 'object' || !Object.keys(theme).length)
      return { error: 'theme is required.' };

    const result = await typeformRequest(typeformToken, `/themes/${encodeURIComponent(themeId)}`, {
      method: 'PUT',
      body: theme,
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
