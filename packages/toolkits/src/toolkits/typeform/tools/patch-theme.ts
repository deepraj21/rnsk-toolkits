// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformPatchTheme = tool({
  description:
    'Partially updates a theme — send only the sections to change (e.g. { colors: { button: "#FF0000" } }) and everything else stays as-is. Needs the themes:write scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    themeId: z.string().min(1).describe('Theme ID to update'),
    theme: z.record(z.any()).describe('Partial theme definition — only the sections to change'),
  }),
  execute: async ({ typeformToken, themeId, theme }) => {
    if (!themeId) return { error: 'themeId is required.' };
    if (!theme || typeof theme !== 'object' || !Object.keys(theme).length)
      return { error: 'theme is required.' };

    const result = await typeformRequest(typeformToken, `/themes/${encodeURIComponent(themeId)}`, {
      method: 'PATCH',
      body: theme,
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
