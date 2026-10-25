// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { openaiRequest, buildForm, missingKey, failedResult, toOpenAIError } from './client.js';

const keyField = z.string().optional().describe('Injected by system; do not provide');
const fileIdField = z.string().describe('File ID (file_...) — get it from openaiListFiles');

const fileField = z
  .object({
    base64: z.string().describe('Raw base64 file bytes, or a data:...;base64,... URL'),
    filename: z.string().describe('File name with extension, e.g. training-data.jsonl'),
    contentType: z.string().optional().describe('MIME type, default application/octet-stream'),
  })
  .describe('File content as base64');

export const openaiUploadFile = tool({
  description:
    'Upload a file to OpenAI (JSONL training data, PDFs, text) so it can be used for fine-tuning, batches, or the Files/vector-store tools. Purpose examples: fine-tune, batch, vision, user_data, assistants.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    file: fileField,
    purpose: z
      .string()
      .describe('What the file is for: fine-tune, batch, vision, user_data, or assistants'),
  }),
  execute: async ({ openaiApiKey, file, purpose }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const form = buildForm({ file, purpose });
      const result = await openaiRequest(openaiApiKey, '/files', {
        method: 'POST',
        form,
      });
      if (!result.ok) return failedResult('Failed to upload file', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error uploading file');
    }
  },
});

export const openaiListFiles = tool({
  description:
    'List files uploaded to the OpenAI project, newest first, with purpose, size, and status (processed, uploading, error).',
  inputSchema: z.object({
    openaiApiKey: keyField,
    purpose: z
      .string()
      .optional()
      .describe('Only files with this purpose, e.g. fine-tune or batch'),
    after: z.string().optional().describe('Cursor for paging — pass the previous last value'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe('Files per page (default 20, max 100)'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort order'),
  }),
  execute: async ({ openaiApiKey, purpose, after, limit, order }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, '/files', {
        query: { purpose, after, limit, order },
      });
      if (!result.ok) return failedResult('Failed to list files', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error listing files');
    }
  },
});

export const openaiGetFile = tool({
  description:
    'Retrieve file metadata: name, purpose, size, creation date, and processing status (check this before using a file in a batch or fine-tune).',
  inputSchema: z.object({
    openaiApiKey: keyField,
    fileId: fileIdField,
  }),
  execute: async ({ openaiApiKey, fileId }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, `/files/${fileId}`);
      if (!result.ok) return failedResult('Failed to get file', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error getting file');
    }
  },
});

export const openaiGetFileContent = tool({
  description:
    'Download the content of a text/JSONL file as a string (for transcripts, batch outputs, fine-tune datasets). Binary files come back base64.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    fileId: fileIdField,
  }),
  execute: async ({ openaiApiKey, fileId }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, `/files/${fileId}/content`);
      if (!result.ok) return failedResult('Failed to download file content', result);
      if (typeof result.data === 'string') return { fileId, content: result.data };
      return {
        fileId,
        contentType: result.contentType,
        note: 'Content is not plain text; refetch inside a purpose-built tool if you need the raw bytes.',
        data: result.data,
      };
    } catch (error) {
      return toOpenAIError(error, 'Error downloading file content');
    }
  },
});

export const openaiDeleteFile = tool({
  description: 'Delete an uploaded file permanently from the OpenAI project.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    fileId: fileIdField,
  }),
  execute: async ({ openaiApiKey, fileId }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, `/files/${fileId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete file', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error deleting file');
    }
  },
});
