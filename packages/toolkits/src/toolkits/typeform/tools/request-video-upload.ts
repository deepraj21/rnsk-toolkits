// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformRequestVideoUpload = tool({
  description:
    'Requests a signed upload URL for a video that belongs to a form field — returns the video ID and a temporary upload_url (expires in ~24 hours) that you PUT the video file to. Needs the images:write scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    formId: z.string().min(1).describe('Form the video belongs to'),
    fieldId: z.string().min(1).describe('Field ID within the form this media belongs to'),
    language: z
      .string()
      .optional()
      .describe('ISO 639-1 language code for transcription/captions, e.g. "en"'),
  }),
  execute: async ({ typeformToken, formId, fieldId, language }) => {
    if (!formId || !fieldId) return { error: 'formId and fieldId are required.' };

    const result = await typeformRequest(typeformToken, '/media/videos', {
      method: 'POST',
      body: { form_id: formId, field_id: fieldId, language },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
