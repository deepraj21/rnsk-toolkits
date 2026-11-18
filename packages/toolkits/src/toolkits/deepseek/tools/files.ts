// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { deepseekRequest, deepseekUpload } from './client.js';

export const deepseekUploadFile = tool({
  description:
    'Uploads a file to the DeepSeek Files API — send purpose first (user_data for general files, text_recognition or rich_layout_recognition for documents that later go through deepseekOcr), then the file content (base64 for binary, utf8 for text) with its filename. Returns a file object with its file_id for later retrieval or deletion. Optionally set expiration (3600s–30 days). Confirm with the user before uploading sensitive data.',
  inputSchema: z.object({
    deepseekToken: z.string().optional().describe('DeepSeek API key (injected by system)'),
    purpose: z
      .enum(['user_data', 'text_recognition', 'rich_layout_recognition'])
      .describe(
        'What the file is for: "user_data" general storage, "text_recognition" OCR text extraction, "rich_layout_recognition" OCR with layout/images',
      ),
    fileContent: z
      .string()
      .min(1)
      .describe('The file bytes — base64 by default, or plain text when encoding is "utf8"'),
    filename: z
      .string()
      .min(1)
      .describe('File name with extension, e.g. "report.pdf" (type inferred from it)'),
    encoding: z
      .enum(['base64', 'utf8'])
      .optional()
      .describe('How fileContent is encoded (default base64)'),
    mimeType: z
      .string()
      .optional()
      .describe('MIME type of the file, e.g. "application/pdf" (default application/octet-stream)'),
    expiresAfterSeconds: z
      .number()
      .int()
      .min(3600)
      .max(2592000)
      .optional()
      .describe('Auto-delete the file after this many seconds (3600 = 1 hour … 2592000 = 30 days)'),
  }),
  execute: async ({
    deepseekToken,
    purpose,
    fileContent,
    filename,
    encoding,
    mimeType,
    expiresAfterSeconds,
  }) => {
    if (!purpose) return { error: 'purpose is required.' };
    if (!fileContent) return { error: 'fileContent is required.' };
    if (!filename) return { error: 'filename is required.' };

    const fields = { purpose };
    if (expiresAfterSeconds !== undefined) {
      fields['expires_after[anchor]'] = 'created_at';
      fields['expires_after[seconds]'] = expiresAfterSeconds;
    }

    const result = await deepseekUpload(deepseekToken, '/files', {
      fields,
      file: {
        field: 'file',
        content: fileContent,
        encoding: encoding ?? 'base64',
        mimeType: mimeType ?? 'application/octet-stream',
        filename,
      },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const deepseekListFiles = tool({
  description:
    'Lists files in the DeepSeek Files API — id, size, filename, purpose, and created/expired timestamps. Paginates with the after cursor (a file_id) and limit (up to 1000), sorted asc/desc by creation time, optionally filtered by purpose. Use it to discover file IDs before retrieving or deleting.',
  inputSchema: z.object({
    deepseekToken: z.string().optional().describe('DeepSeek API key (injected by system)'),
    after: z
      .string()
      .optional()
      .describe('Cursor: return files created after this file_id (from a previous page)'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(1000)
      .optional()
      .describe('Max files to return (1-1000, default 1000)'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort by creation time (default desc)'),
    purpose: z
      .enum(['user_data', 'text_recognition', 'rich_layout_recognition'])
      .optional()
      .describe('Only return files with this purpose'),
  }),
  execute: async ({ deepseekToken, after, limit, order, purpose }) => {
    const result = await deepseekRequest(deepseekToken, '/files', {
      query: { after, limit, order, purpose },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const deepseekRetrieveFile = tool({
  description:
    "Retrieves one file's metadata by file_id — bytes, filename, purpose, created_at, and optional expiration. Returns metadata only (not the bytes); it is the safest way to confirm a file exists before deleting it.",
  inputSchema: z.object({
    deepseekToken: z.string().optional().describe('DeepSeek API key (injected by system)'),
    fileId: z.string().min(1).describe('File ID, e.g. "file-api-0a1b2c3d4e5f60718293a4b5c6d7e8f9"'),
  }),
  execute: async ({ deepseekToken, fileId }) => {
    if (!fileId) return { error: 'fileId is required.' };

    const result = await deepseekRequest(deepseekToken, `/files/${encodeURIComponent(fileId)}`);
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const deepseekDeleteFile = tool({
  description:
    'Deletes one file from the DeepSeek Files API by file_id — permanent and immediate, anything referencing the file stops working. Confirm with the user first; check existence with deepseekRetrieveFile if unsure.',
  inputSchema: z.object({
    deepseekToken: z.string().optional().describe('DeepSeek API key (injected by system)'),
    fileId: z.string().min(1).describe('File ID to delete'),
  }),
  execute: async ({ deepseekToken, fileId }) => {
    if (!fileId) return { error: 'fileId is required.' };

    const result = await deepseekRequest(deepseekToken, `/files/${encodeURIComponent(fileId)}`, {
      method: 'DELETE',
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
