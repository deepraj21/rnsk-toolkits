// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { compact, typeformRequest } from './client.js';

export const typeformCreateForm = tool({
  description:
    'Creates a new typeform (survey) with an optional set of questions, settings, and destination workspace. Returns the created form definition including its ID. Any images referenced by fields must already exist in the account (see typeformCreateImage). Needs the forms:write scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    title: z.string().min(1).describe('Title of the new form'),
    fields: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        'Question definitions — each { title, type, ref, properties?, validations? }; types include short_text, long_text, multiple_choice, dropdown, opinion_scale, rating, email, number, date, legal, statement',
      ),
    settings: z
      .record(z.any())
      .optional()
      .describe(
        'Form settings — language, is_public, progress_bar, show_progress_bar, show_question_number, captcha...',
      ),
    workspaceId: z
      .string()
      .optional()
      .describe('Workspace ID to store the form in (default workspace if omitted)'),
    themeId: z.string().optional().describe('Theme ID to apply to the form'),
    hidden: z
      .array(z.string())
      .optional()
      .describe('Hidden field names to declare on the form (e.g. ["user_id"])'),
    welcomeScreens: z
      .array(z.record(z.any()))
      .optional()
      .describe('Welcome screen definitions — { title, properties?, attachment? }'),
    thankyouScreens: z
      .array(z.record(z.any()))
      .optional()
      .describe('Thank-you screen definitions — { title, type, properties? }'),
    logic: z
      .array(z.record(z.any()))
      .optional()
      .describe('Logic jumps — { type, ref, actions } objects'),
    meta: z
      .record(z.any())
      .optional()
      .describe(
        'Form meta — title, description, allow_indexing, redirect_after_submit_url, google_analytics...',
      ),
  }),
  execute: async ({
    typeformToken,
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
    if (!title || !String(title).trim()) return { error: 'title is required.' };

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

    const result = await typeformRequest(typeformToken, '/forms', { method: 'POST', body });
    if (result.error) return result;

    return result.data ?? {};
  },
});
