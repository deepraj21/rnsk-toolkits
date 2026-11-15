// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxContent } from './client.js';

const MAX_SINGLE_UPLOAD = 150 * 1024 * 1024; // 150 MiB

export const dropboxUploadFile = tool({
  description:
    'Uploads a file to Dropbox at the given path and returns its metadata. The content is provided as a string (utf8 by default, or base64 for binary). Use mode "add" (default, fails on conflict), "overwrite", or autorename=true to resolve conflicts. Single-request uploads are limited to 150 MiB.',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
    path: z.string().min(1).describe('Destination path including filename, e.g. "/Notes/todo.md"'),
    content: z.string().describe('File content as a string'),
    encoding: z
      .enum(['utf8', 'base64'])
      .optional()
      .describe('How to interpret content (default "utf8"; use "base64" for binary)'),
    mode: z
      .enum(['add', 'overwrite'])
      .optional()
      .describe('Conflict behavior: "add" (default) or "overwrite" an existing file'),
    autorename: z
      .boolean()
      .optional()
      .describe('On conflict, auto-rename instead of failing (default false)'),
    mute: z.boolean().optional().describe('Suppress the user notification for this change'),
    strictConflict: z
      .boolean()
      .optional()
      .describe('Treat any existing file at the path as a conflict, even if identical'),
    clientModified: z
      .string()
      .optional()
      .describe('ISO 8601 timestamp to store as the file’s client_modified time'),
  }),
  execute: async ({
    dropboxToken,
    path,
    content,
    encoding,
    mode,
    autorename,
    mute,
    strictConflict,
    clientModified,
  }) => {
    if (!path) return { error: 'path is required.' };
    if (content === undefined || content === null) return { error: 'content is required.' };

    const buffer =
      encoding === 'base64' ? Buffer.from(content, 'base64') : Buffer.from(content, 'utf8');
    if (buffer.length > MAX_SINGLE_UPLOAD) {
      return {
        error: `Content is ${buffer.length} bytes; single-request uploads are limited to 150 MiB. Split the file with upload sessions (not exposed in this toolkit) or upload a smaller file.`,
      };
    }

    const result = await dropboxContent(dropboxToken, '/files/upload', {
      arg: {
        path,
        mode: mode ?? 'add',
        autorename,
        mute,
        strict_conflict: strictConflict,
        client_modified: clientModified,
      },
      body: buffer,
      contentType: 'application/octet-stream',
    });
    if (result.error) return result;

    return result.data;
  },
});
