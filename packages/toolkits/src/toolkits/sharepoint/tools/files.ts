// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
  graphRequest,
  driveBase,
  driveItemRef,
  folderRef,
  isTextContent,
  failedResult,
  toSharePointError,
} from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const siteIdField = z.string().describe('SharePoint site ID — get it from sharepointSearchSites');
const driveIdField = z
  .string()
  .optional()
  .describe('Document library ID for a non-default library (default is the site\'s default library)');
const itemIdField = z.string().describe('Drive item ID — get it from sharepointListFiles or sharepointGetFile');
const pathField = z
  .string()
  .describe('Library-relative path, e.g. "Reports/2026/q3.xlsx" ("" means the library root)');

export const sharepointListFiles = tool({
  description:
    'List files and folders inside a SharePoint document library folder. Omit folderPath to list the library root.',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    driveId: driveIdField,
    folderPath: pathField.optional().describe('Folder path to browse, e.g. "Reports/2026" (default: library root)'),
    filter: z.string().optional().describe('OData filter on driveItem, e.g. lastModifiedDateTime gt 2026-01-01'),
    select: z.string().optional().describe('Comma-separated fields to return'),
  }),
  execute: async ({ sharepointToken, siteId, driveId, folderPath, filter, select }) => {
    try {
      const base = driveBase(siteId, driveId);
      const result = await graphRequest(sharepointToken, `${base}${folderRef(folderPath)}/children`, {
        query: { $filter: filter, $select: select },
      });
      if (!result.ok) return failedResult('Failed to list files', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error listing files');
    }
  },
});

export const sharepointGetFile = tool({
  description:
    'Get metadata for one file or folder: name, size, timestamps, web URL, and pre-authenticated download URL. Address it by path or item ID.',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    driveId: driveIdField,
    path: pathField.optional(),
    itemId: itemIdField.optional().describe('Drive item ID (takes precedence over path when both are given)'),
    select: z.string().optional().describe('Comma-separated fields to return'),
    expand: z.string().optional().describe('Related resources to expand, e.g. permissions'),
  }),
  execute: async ({ sharepointToken, siteId, driveId, path, itemId, select, expand }) => {
    try {
      const base = driveBase(siteId, driveId);
      const result = await graphRequest(sharepointToken, `${base}${driveItemRef(path, itemId)}`, {
        query: { $select: select, $expand: expand },
      });
      if (!result.ok) return failedResult('Failed to get file', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error getting file');
    }
  },
});

export const sharepointGetFileContent = tool({
  description:
    'Download the content of a text-based file (txt, csv, json, md, html, code) from a SharePoint library as a string. Binary files return their download URL instead.',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    driveId: driveIdField,
    path: pathField.optional(),
    itemId: itemIdField.optional(),
  }),
  execute: async ({ sharepointToken, siteId, driveId, path, itemId }) => {
    try {
      const base = driveBase(siteId, driveId);
      const ref = driveItemRef(path, itemId);
      const meta = await graphRequest(sharepointToken, `${base}${ref}`, {
        query: { $select: 'id,name,size,file' },
      });
      if (!meta.ok) return failedResult('Failed to get file', meta);
      const mimeType = meta.data?.file?.mimeType;
      const content = await graphRequest(sharepointToken, `${base}${ref}/content`);
      if (!content.ok) return failedResult('Failed to download file content', content);
      if (typeof content.data !== 'string' || !isTextContent(content.contentType, mimeType)) {
        return {
          note: 'File content is binary and cannot be returned as text. Use sharepointGetFile to fetch its download URL.',
          file: meta.data,
        };
      }
      return {
        id: meta.data?.id,
        name: meta.data?.name,
        size: meta.data?.size,
        mimeType: mimeType ?? content.contentType,
        content: content.data,
      };
    } catch (error) {
      return toSharePointError(error, 'Error downloading file content');
    }
  },
});

export const sharepointCreateFolder = tool({
  description: 'Create a folder in a SharePoint document library at the given path.',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    driveId: driveIdField,
    folderPath: pathField.optional().describe('Parent folder path (default: library root)'),
    name: z.string().describe('Folder name to create, e.g. "Q3 Reports"'),
  }),
  execute: async ({ sharepointToken, siteId, driveId, folderPath, name }) => {
    try {
      const base = driveBase(siteId, driveId);
      const result = await graphRequest(sharepointToken, `${base}${folderRef(folderPath)}/children`, {
        method: 'POST',
        body: { name, folder: {} },
      });
      if (!result.ok) return failedResult('Failed to create folder', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error creating folder');
    }
  },
});

export const sharepointUploadFile = tool({
  description:
    'Upload a small text file to a SharePoint document library (simple upload, up to 250 MB). Overwrites an existing file with the same name.',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    driveId: driveIdField,
    folderPath: pathField.optional().describe('Destination folder path (default: library root)'),
    fileName: z.string().describe('File name to write, e.g. "notes.md"'),
    content: z.string().describe('Raw file content sent as-is (text, CSV, JSON, etc.)'),
  }),
  execute: async ({ sharepointToken, siteId, driveId, folderPath, fileName, content }) => {
    try {
      const base = driveBase(siteId, driveId);
      const trimmedFolder = (folderPath ?? '').replace(/^\/+|\/+$/g, '').trim();
      const target = trimmedFolder ? `${trimmedFolder}/${fileName}` : fileName;
      const result = await graphRequest(sharepointToken, `${base}/root:/${target}:/content`, {
        method: 'PUT',
        rawBody: content,
      });
      if (!result.ok) return failedResult('Failed to upload file', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error uploading file');
    }
  },
});

export const sharepointDeleteFile = tool({
  description: 'Delete a file or folder from a SharePoint document library (moves it to the site recycle bin).',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    driveId: driveIdField,
    path: pathField.optional(),
    itemId: itemIdField.optional(),
  }),
  execute: async ({ sharepointToken, siteId, driveId, path, itemId }) => {
    try {
      const base = driveBase(siteId, driveId);
      const result = await graphRequest(sharepointToken, `${base}${driveItemRef(path, itemId)}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete file', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toSharePointError(error, 'Error deleting file');
    }
  },
});

export const sharepointMoveFile = tool({
  description:
    'Move a file or folder to another folder in the same library by destination folder ID, optionally renaming it on the way.',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    driveId: driveIdField,
    itemId: itemIdField,
    destinationFolderId: z.string().describe('Drive item ID of the destination folder'),
    newName: z.string().optional().describe('Rename the item during the move'),
  }),
  execute: async ({ sharepointToken, siteId, driveId, itemId, destinationFolderId, newName }) => {
    try {
      const base = driveBase(siteId, driveId);
      const result = await graphRequest(sharepointToken, `${base}/items/${itemId}`, {
        method: 'PATCH',
        body: {
          parentReference: { id: destinationFolderId },
          ...(newName ? { name: newName } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to move file', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error moving file');
    }
  },
});

export const sharepointCopyFile = tool({
  description:
    'Copy a file or folder to a destination folder (by ID). SharePoint accepts the request and processes the copy asynchronously.',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    driveId: driveIdField,
    itemId: itemIdField,
    destinationFolderId: z.string().optional().describe('Drive item ID of the destination folder (omit to copy in place)'),
    name: z.string().optional().describe('Name for the copy, e.g. "q3 (copy).xlsx"'),
  }),
  execute: async ({ sharepointToken, siteId, driveId, itemId, destinationFolderId, name }) => {
    try {
      const base = driveBase(siteId, driveId);
      const result = await graphRequest(sharepointToken, `${base}/items/${itemId}/copy`, {
        method: 'POST',
        body: {
          ...(name ? { name } : {}),
          ...(destinationFolderId ? { parentReference: { id: destinationFolderId } } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to copy file', result);
      return result.data ?? {
        accepted: true,
        note: 'Copy accepted; large copies finish asynchronously on the server.',
      };
    } catch (error) {
      return toSharePointError(error, 'Error copying file');
    }
  },
});

export const sharepointSearchFiles = tool({
  description:
    'Full-text search across SharePoint files and documents in the tenant using Microsoft Search (finds content, not just names).',
  inputSchema: z.object({
    sharepointToken: tokenField,
    query: z.string().describe('Search query, e.g. "vendor contract renewal"'),
    size: z.number().int().min(1).max(25).optional().describe('Results per page (default 25)'),
    from: z.number().int().min(0).optional().describe('Result offset for paging'),
  }),
  execute: async ({ sharepointToken, query, size, from }) => {
    try {
      const result = await graphRequest(sharepointToken, '/search/query', {
        method: 'POST',
        body: {
          requests: [
            {
              entityTypes: ['driveItem'],
              query: { queryString: query },
              ...(size ? { size } : {}),
              ...(from !== undefined ? { from } : {}),
            },
          ],
        },
      });
      if (!result.ok) return failedResult('Failed to search files', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error searching files');
    }
  },
});
