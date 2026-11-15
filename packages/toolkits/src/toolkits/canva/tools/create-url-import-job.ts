// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest, compact } from './client.js';

export const canvaCreateUrlImportJob = tool({
  description:
    'Starts an async job that imports a file from a public URL as a new Canva design — no need to pass file bytes. The URL must be internet-accessible; MIME type is auto-detected unless you set it. Returns a job — poll canvaGetUrlImportJob until status is success to get the new design ID.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    title: z.string().min(1).max(255).describe('Title for the imported design (max 255 chars)'),
    url: z
      .string()
      .min(1)
      .max(2048)
      .describe(
        'Publicly accessible URL of the file to import, e.g. https://example.com/deck.pptx',
      ),
    mimeType: z
      .string()
      .max(100)
      .optional()
      .describe(
        'MIME type of the file, e.g. "application/vnd.apple.keynote" (auto-detected if omitted)',
      ),
  }),
  execute: async ({ canvaToken, title, url, mimeType }) => {
    if (!title) return { error: 'title is required.' };
    if (!url) return { error: 'url is required.' };

    const result = await canvaRequest(canvaToken, '/url-imports', {
      method: 'POST',
      body: compact({ title, url, mime_type: mimeType }),
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
