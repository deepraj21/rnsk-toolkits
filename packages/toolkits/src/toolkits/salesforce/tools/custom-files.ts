// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { parseSfCredentials, sfGet, sfPost } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const salesforceGetFileContent = tool({
  description:
    'Download a Salesforce file (ContentDocument) as base64: latest version by default, a specific version_id, or a rendition (thumbnail/pdf). Returns content, mime type and size.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    file_id: z.string().describe('ContentDocument or ContentVersion Id.'),
    version_id: z.string().optional().describe('Specific ContentVersion Id (default: latest).'),
    rendition_type: z
      .string()
      .optional()
      .describe('Rendition, e.g. THUMB120BY90, THUMB240BY180, ORIGINAL_Pdf.'),
  }),
  execute: async ({ salesforceCredentials, file_id, version_id, rendition_type }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    let creds;
    try {
      creds = parseSfCredentials(salesforceCredentials);
    } catch (error) {
      return {
        error: 'Invalid Salesforce credentials',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
    try {
      if (rendition_type && !version_id) {
        const res = await fetch(
          `${creds.instanceUrl}/services/data/v62.0/sobjects/ContentDocument/${file_id}/rendition?type=${encodeURIComponent(rendition_type)}`,
          { headers: { Authorization: `Bearer ${creds.accessToken}` } },
        );
        if (!res.ok) {
          const details = await res.text().catch(() => '');
          return { error: `Salesforce API error ${res.status}`, details };
        }
        const buf = Buffer.from(await res.arrayBuffer());
        return {
          content: {
            name: file_id,
            mimetype: res.headers.get('content-type') || 'application/octet-stream',
            s3url: '',
            base64: buf.toString('base64'),
            size: buf.length,
          },
        };
      }
      let versionId = version_id;
      let mimeType: string | null = null;
      if (!versionId) {
        const isVersion = file_id.startsWith('068');
        if (isVersion) {
          versionId = file_id;
        } else {
          const versions = (await sfGet(salesforceCredentials, '/query', {
            query: {
              q: `SELECT Id, FileType FROM ContentVersion WHERE ContentDocumentId = '${file_id}' ORDER BY VersionNumber DESC LIMIT 1`,
            },
          })) as { records?: { Id: string }[]; error?: string };
          if (versions && versions.error) return versions;
          versionId = (versions.records ?? [])[0]?.Id;
          if (!versionId) return { error: 'No versions found for this file.' };
        }
      }
      const res = await fetch(
        `${creds.instanceUrl}/services/data/v62.0/sobjects/ContentVersion/${versionId}/VersionData`,
        {
          headers: { Authorization: `Bearer ${creds.accessToken}` },
        },
      );
      if (!res.ok) {
        const details = await res.text().catch(() => '');
        return { error: `Salesforce API error ${res.status}`, details };
      }
      const buf = Buffer.from(await res.arrayBuffer());
      mimeType = res.headers.get('content-type');
      return {
        content: {
          name: versionId,
          mimetype: mimeType || 'application/octet-stream',
          s3url: '',
          base64: buf.toString('base64'),
          size: buf.length,
        },
      };
    } catch (error) {
      return {
        error: 'Error downloading Salesforce file',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

export const salesforceUploadFile = tool({
  description:
    'Upload a file to Salesforce Files from base64 content (filename + content_b64), optionally linked to a record via first_publish_location_id. Max 50 MB per request.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    filename: z.string().optional().describe('File name with extension (use with content_b64).'),
    content_b64: z.string().optional().describe('Base64-encoded file content (use with filename).'),
    title: z.string().optional().describe('Title in Salesforce (defaults to filename).'),
    desc: z.string().optional().describe('File description.'),
    mimetype_override: z
      .string()
      .optional()
      .describe('MIME type (defaults to application/octet-stream).'),
    first_publish_location_id: z
      .string()
      .optional()
      .describe('Record Id to attach the file to (omit for personal library).'),
    file: z
      .record(z.any())
      .optional()
      .describe('Legacy file reference; prefer filename + content_b64.'),
  }),
  execute: async ({
    salesforceCredentials,
    filename,
    content_b64,
    title,
    desc,
    mimetype_override,
    first_publish_location_id,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    if (!filename || !content_b64)
      return { error: 'filename and content_b64 are both required to upload a file.' };
    let buffer: Buffer;
    try {
      buffer = Buffer.from(content_b64, 'base64');
    } catch {
      return { error: 'content_b64 must be valid base64.' };
    }
    if (buffer.length > 50 * 1024 * 1024)
      return { error: 'File exceeds the 50 MB Salesforce upload limit.' };
    const form = new FormData();
    form.append(
      'entity_content',
      JSON.stringify({
        Title: title || filename,
        PathOnClient: filename,
        ...(desc ? { Description: desc } : {}),
        ...(first_publish_location_id ? { FirstPublishLocationId: first_publish_location_id } : {}),
      }),
    );
    form.append(
      'VersionData',
      new Blob([buffer], { type: mimetype_override || 'application/octet-stream' }),
      filename,
    );
    let creds;
    try {
      creds = parseSfCredentials(salesforceCredentials);
    } catch (error) {
      return {
        error: 'Invalid Salesforce credentials',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
    try {
      const res = await fetch(`${creds.instanceUrl}/services/data/v62.0/sobjects/ContentVersion`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${creds.accessToken}` },
        body: form,
      });
      const text = await res.text();
      let data: unknown = text;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        /* keep text */
      }
      if (!res.ok) return { error: `Salesforce API error ${res.status}`, details: data };
      return data;
    } catch (error) {
      return {
        error: 'Error uploading file to Salesforce',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
