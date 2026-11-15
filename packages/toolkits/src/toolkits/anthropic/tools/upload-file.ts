// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { anthropicUpload, fileBlob } from './client.js';

const MIME_TYPES = {
  text: 'text/plain',
  txt: 'text/plain',
  md: 'text/markdown',
  markdown: 'text/markdown',
  json: 'application/json',
  csv: 'text/csv',
  html: 'text/html',
  pdf: 'application/pdf',
  png: 'image/png',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
};

const BASE64_TYPES = new Set(['pdf', 'png', 'jpeg', 'jpg', 'gif', 'webp']);

export const anthropicUploadFile = tool({
  description:
    'Uploads a file to your Anthropic workspace so it can be referenced in messages. Pass plain text in content for documents (txt, md, json, csv, html), or base64 with encoding: "base64" for binary files (pdf, png, jpg, gif, webp). The file name determines the MIME type unless you set mimeType.',
  inputSchema: z.object({
    anthropicApiKey: z.string().optional().describe('Anthropic API key (injected by system)'),
    filename: z.string().describe('File name with extension, e.g. "report.pdf" or "notes.md"'),
    content: z.string().describe('File contents (plain text, or base64 when encoding is base64)'),
    encoding: z
      .enum(['utf8', 'base64'])
      .optional()
      .describe('How to interpret content (default: utf8, or base64 for binary extensions)'),
    mimeType: z.string().optional().describe('Override the MIME type inferred from the filename'),
  }),
  execute: async ({ anthropicApiKey, filename, content, encoding, mimeType }) => {
    if (!filename) return { error: 'filename is required.' };
    if (content === undefined || content === null || content === '') {
      return { error: 'content is required.' };
    }

    const extension = String(filename).split('.').pop()?.toLowerCase() ?? '';
    const type =
      mimeType ??
      MIME_TYPES[extension] ??
      (BASE64_TYPES.has(extension) ? 'application/octet-stream' : 'text/plain');
    const finalEncoding = encoding ?? (BASE64_TYPES.has(extension) ? 'base64' : 'utf8');

    const form = new FormData();
    form.append('file', fileBlob(content, finalEncoding, type), String(filename));

    const result = await anthropicUpload(anthropicApiKey, '/v1/files', form);
    if (result.error) return result;

    return result.data;
  },
});
