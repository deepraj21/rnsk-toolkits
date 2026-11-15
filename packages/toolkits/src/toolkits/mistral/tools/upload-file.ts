// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralUpload } from './client.js';

export const mistralUploadFile = tool({
  description:
    'Uploads a file to the Mistral workspace and returns its id, purpose, size, and mimetype. Use the returned id with batch jobs, OCR (fileId), transcribeAudio (fileId), or file-content tools. Max file size is 512 MB; fine-tuning inputs must be .jsonl.',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    content: z.string().describe('File content as a string'),
    encoding: z
      .enum(['utf8', 'base64'])
      .optional()
      .describe('How to interpret content (default "utf8"; use "base64" for binary)'),
    filename: z.string().min(1).describe('Filename with extension, e.g. "dataset.jsonl"'),
    mimeType: z.string().optional().describe('MIME type, e.g. "application/jsonl"'),
    purpose: z
      .enum(['fine-tune', 'batch', 'ocr', 'agentic_safety'])
      .optional()
      .describe('What the file will be used for (default: workspace file)'),
    visibility: z
      .enum(['workspace', 'user'])
      .optional()
      .describe('Scope of the file (default "workspace")'),
  }),
  execute: async ({ mistralToken, content, encoding, filename, mimeType, purpose, visibility }) => {
    if (content === undefined || content === null || content === '')
      return { error: 'content is required.' };
    if (!filename) return { error: 'filename is required.' };

    const result = await mistralUpload(mistralToken, '/files', {
      fields: { purpose, visibility },
      file: {
        field: 'file',
        content,
        encoding: encoding ?? 'utf8',
        mimeType: mimeType ?? 'application/octet-stream',
        filename,
      },
    });
    if (result.error) return result;

    return result.data;
  },
});
