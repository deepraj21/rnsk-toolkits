// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformDownloadResponseFiles = tool({
  description:
    'Downloads a ZIP archive of every file respondents have uploaded to a form. Returns a descriptor with the archive’s content type and URL instead of raw bytes (204 means the form has no file-upload fields). Needs the responses:read scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    formId: z.string().min(1).describe('Form ID whose uploaded files to download'),
  }),
  execute: async ({ typeformToken, formId }) => {
    if (!formId) return { error: 'formId is required.' };

    const result = await typeformRequest(
      typeformToken,
      `/forms/${encodeURIComponent(formId)}/responses/files`,
    );
    if (result.error) return result;

    return result.data ?? { status: result.status };
  },
});
