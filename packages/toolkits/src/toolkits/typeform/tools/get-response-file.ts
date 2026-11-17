// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformGetResponseFile = tool({
  description:
    'Gets a file that a respondent uploaded in a response (file_upload field). Returns a descriptor with the file’s content type and download URL instead of raw bytes — fetch that URL with the Typeform token to download it. The file URL is also present as file_url in the response’s answers. Needs the responses:read scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    formId: z.string().min(1).describe('Form ID'),
    responseId: z.string().min(1).describe('Response ID that contains the file'),
    fieldId: z.string().min(1).describe('ID of the file_upload field'),
    filename: z.string().min(1).describe('Uploaded file name, including extension'),
    inline: z
      .boolean()
      .optional()
      .describe('Request Content-Disposition: inline instead of attachment (default false)'),
  }),
  execute: async ({ typeformToken, formId, responseId, fieldId, filename, inline }) => {
    if (!formId || !responseId || !fieldId || !filename)
      return { error: 'formId, responseId, fieldId and filename are required.' };

    const path =
      `/forms/${encodeURIComponent(formId)}/responses/${encodeURIComponent(responseId)}` +
      `/fields/${encodeURIComponent(fieldId)}/files/${encodeURIComponent(filename)}`;
    const result = await typeformRequest(typeformToken, path, {
      query: { inline: inline === undefined ? undefined : String(inline) },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
