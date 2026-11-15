// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRaw, b64, toBuffer, compact } from './client.js';

export const canvaCreateDesignImportJob = tool({
  description:
    'Starts an async job that imports an external file (PPTX, PDF, DOCX, JPEG, PNG, etc.) as a new Canva design. Pass file bytes as utf8 or base64; the title (max 50 chars) is sent base64-encoded in the Import-Metadata header. Returns a job — poll canvaGetDesignImportJob until status is success to get the new design ID.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    content: z.string().describe('File content as a string'),
    encoding: z
      .enum(['utf8', 'base64'])
      .optional()
      .describe('How to interpret content (default "utf8"; use "base64" for binary)'),
    title: z
      .string()
      .min(1)
      .max(50)
      .describe('Title for the imported design (max 50 chars, may include emoji)'),
    mimeType: z
      .string()
      .max(100)
      .optional()
      .describe('MIME type of the file, e.g. "application/pdf" (auto-detected if omitted)'),
  }),
  execute: async ({ canvaToken, content, encoding, title, mimeType }) => {
    if (content === undefined || content === null || content === '')
      return { error: 'content is required.' };
    if (!title) return { error: 'title is required.' };

    const result = await canvaRaw(canvaToken, '/imports', {
      body: toBuffer(content, encoding ?? 'utf8'),
      headers: {
        // Content-Type stays application/octet-stream (canvaRaw default);
        // the file's MIME type travels inside the metadata header.
        'Import-Metadata': JSON.stringify(
          compact({ title_base64: b64(title), mime_type: mimeType }),
        ),
      },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
