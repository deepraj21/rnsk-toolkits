// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxContent } from './client.js';

const MAX_INLINE_BYTES = 2 * 1024 * 1024; // 2 MiB

export const dropboxDownloadFile = tool({
  description:
    'Downloads a file from Dropbox and returns its metadata plus content: text files come back as utf8 content, binary files as base64. Files larger than 2 MiB return metadata only (use dropboxGetTemporaryLink for those). Optionally pin a specific revision with rev.',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
    path: z.string().min(1).describe('File path or "id:..." file id, e.g. "/Notes/todo.md"'),
    rev: z.string().optional().describe('Specific revision (from listFileRevisions) to download'),
  }),
  execute: async ({ dropboxToken, path, rev }) => {
    if (!path) return { error: 'path is required.' };

    const result = await dropboxContent(dropboxToken, '/files/download', {
      arg: rev ? { path, rev } : { path },
    });
    if (result.error) return result;

    const metadata =
      result.apiResult ?? (result.data && typeof result.data === 'object' ? result.data : null);
    const buffer = result.buffer ?? Buffer.alloc(0);

    if (buffer.length > MAX_INLINE_BYTES) {
      return {
        metadata,
        encoding: 'omitted',
        size: buffer.length,
        note: 'File exceeds the 2 MiB inline limit, so content was not returned. Use dropboxGetTemporaryLink to get a short-lived download URL instead.',
      };
    }

    const text = buffer.toString('utf8');
    if (!text.includes('\uFFFD') && !text.includes('\u0000')) {
      return { metadata, encoding: 'utf8', content: text, size: buffer.length };
    }
    return {
      metadata,
      encoding: 'base64',
      content: buffer.toString('base64'),
      size: buffer.length,
    };
  },
});
