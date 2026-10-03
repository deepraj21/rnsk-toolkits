// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { asanaDelete, asanaGet, asanaPost, asanaUpload, optQuery, pageQuery } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const gid = (label: string) => z.string().describe(label);
const optFields = z.array(z.string()).optional().describe('Extra fields to include');
const optPretty = z.boolean().optional().describe('Pretty-print response (debugging only)');

export const asanaGetAttachment = tool({
  description: 'Get attachment metadata (name, URL, host, size) by GID.',
  inputSchema: z.object({
    asanaToken: tokenField,
    attachmentGid: gid('Attachment GID'),
    optFields,
  }),
  execute: ({ asanaToken, attachmentGid, optFields }) =>
    asanaGet(asanaToken, `/attachments/${attachmentGid}`, {
      query: optQuery(optFields, undefined),
    }),
});

export const asanaDeleteAttachment = tool({
  description: 'Delete an attachment.',
  inputSchema: z.object({
    asanaToken: tokenField,
    attachmentGid: gid('Attachment GID to delete'),
    optPretty,
  }),
  execute: ({ asanaToken, attachmentGid, optPretty }) =>
    asanaDelete(asanaToken, `/attachments/${attachmentGid}`, {
      query: optQuery(undefined, optPretty),
    }),
});

export const asanaGetTaskAttachments = tool({
  description: 'List attachments on a task.',
  inputSchema: z.object({
    asanaToken: tokenField,
    parentGid: z.string().describe('Task GID to list attachments for'),
    limit: z.number().int().min(1).max(100).optional().describe('Results per page'),
    offset: z.string().optional().describe('Pagination offset token'),
    optFields,
  }),
  execute: ({ asanaToken, parentGid, limit, offset, optFields }) =>
    asanaGet(asanaToken, `/tasks/${parentGid}/attachments`, {
      query: { ...pageQuery(limit, offset), ...optQuery(optFields, undefined) },
    }),
});

export const asanaCreateAttachmentForTask = tool({
  description: 'Upload a file attachment to a task (multipart upload).',
  inputSchema: z.object({
    asanaToken: tokenField,
    parentGid: z.string().describe('Task GID to attach the file to'),
    fileName: z.string().describe('File name, e.g. "spec.pdf"'),
    fileContentBase64: z.string().describe('Base64-encoded file content'),
    contentType: z.string().optional().describe('MIME type, e.g. "application/pdf"'),
    connectToApp: z.boolean().optional().describe('Link as an external app attachment'),
    resourceSubtype: z.string().optional().describe('Subtype, e.g. "external"'),
  }),
  execute: ({
    asanaToken,
    parentGid,
    fileName,
    fileContentBase64,
    contentType,
    connectToApp,
    resourceSubtype,
  }) =>
    asanaUpload(
      asanaToken,
      `/tasks/${parentGid}/attachments`,
      { fileName, fileContentBase64, contentType },
      {
        ...(connectToApp !== undefined ? { connect_to_app: String(connectToApp) } : {}),
        ...(resourceSubtype ? { resource_subtype: resourceSubtype } : {}),
      },
    ),
});

export const asanaCreateAttachmentForObject = tool({
  description: 'Attach a URL link or upload a file to any object (task, project, etc.).',
  inputSchema: z.object({
    asanaToken: tokenField,
    parent: z.string().describe('Parent object GID to attach to'),
    url: z.string().optional().describe('URL to attach (for link attachments)'),
    name: z.string().optional().describe('Attachment name (used with url)'),
    fileName: z
      .string()
      .optional()
      .describe('File name (for file uploads; requires fileContentBase64)'),
    fileContentBase64: z
      .string()
      .optional()
      .describe('Base64-encoded file content (for file uploads)'),
    contentType: z.string().optional().describe('MIME type for file uploads'),
    connectToApp: z.boolean().optional().describe('Link as an external app attachment'),
    resourceSubtype: z.string().optional().describe('Subtype, e.g. "external"'),
  }),
  execute: ({
    asanaToken,
    parent,
    url,
    name,
    fileName,
    fileContentBase64,
    contentType,
    connectToApp,
    resourceSubtype,
  }) => {
    if (url) {
      return asanaPost(asanaToken, '/attachments', {
        body: {
          parent,
          url,
          name,
          connect_to_app: connectToApp,
          resource_subtype: resourceSubtype,
        },
      });
    }
    return asanaUpload(
      asanaToken,
      '/attachments',
      { fileName, fileContentBase64, contentType },
      {
        parent,
        ...(name ? { name } : {}),
        ...(connectToApp !== undefined ? { connect_to_app: String(connectToApp) } : {}),
        ...(resourceSubtype ? { resource_subtype: resourceSubtype } : {}),
      },
    );
  },
});
