// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { compact, typeformRequest } from './client.js';

export const typeformUpdateForm = tool({
  description:
    'Replaces the whole definition of a typeform (title, fields, settings, screens, logic) — omitted top-level sections are cleared. For small changes prefer typeformPatchForm, which applies targeted operations. Needs the forms:write scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    formId: z.string().min(1).describe('Form ID to replace'),
    title: z.string().optional().describe('New form title'),
    fields: z
      .array(z.record(z.any()))
      .optional()
      .describe('Full new list of question definitions ({ title, type, ref, ... })'),
    settings: z.record(z.any()).optional().describe('Full new form settings object'),
    workspaceId: z
      .string()
      .optional()
      .describe('Workspace ID to move the form into (clears workspace if omitted)'),
    themeId: z.string().optional().describe('Theme ID to apply'),
    hidden: z.array(z.string()).optional().describe('Hidden field names'),
    welcomeScreens: z.array(z.record(z.any())).optional().describe('Welcome screens'),
    thankyouScreens: z.array(z.record(z.any())).optional().describe('Thank-you screens'),
    logic: z.array(z.record(z.any())).optional().describe('Logic jumps'),
    meta: z.record(z.any()).optional().describe('Form meta (title, description, redirects...)'),
  }),
  execute: async ({
    typeformToken,
    formId,
    title,
    fields,
    settings,
    workspaceId,
    themeId,
    hidden,
    welcomeScreens,
    thankyouScreens,
    logic,
    meta,
  }) => {
    if (!formId) return { error: 'formId is required.' };

    const body = compact({
      title,
      fields,
      settings,
      workspace: workspaceId
        ? { href: `https://api.typeform.com/workspaces/${workspaceId}` }
        : undefined,
      theme: themeId ? { href: `https://api.typeform.com/themes/${themeId}` } : undefined,
      hidden,
      welcome_screens: welcomeScreens,
      thankyou_screens: thankyouScreens,
      logic,
      meta,
    });

    const result = await typeformRequest(typeformToken, `/forms/${encodeURIComponent(formId)}`, {
      method: 'PUT',
      body,
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
