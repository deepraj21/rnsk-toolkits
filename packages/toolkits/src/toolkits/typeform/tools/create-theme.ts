// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformCreateTheme = tool({
  description:
    'Creates a theme in the account. Pass the theme definition directly — colors (answer/background/button/question hex values), background (brightness, layout, image), fonts, and field styles. Needs the themes:write scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    theme: z
      .record(z.any())
      .describe(
        'Theme definition — e.g. { colors: { answer: "#4FB0AE", background: "#FFFFFF", button: "#333333", question: "#000000" }, background: { brightness: -0.2, layout: "fullscreen" }, fonts: {...} }',
      ),
  }),
  execute: async ({ typeformToken, theme }) => {
    if (!theme || typeof theme !== 'object' || !Object.keys(theme).length)
      return { error: 'theme is required.' };

    const result = await typeformRequest(typeformToken, '/themes', { method: 'POST', body: theme });
    if (result.error) return result;

    return result.data ?? {};
  },
});
