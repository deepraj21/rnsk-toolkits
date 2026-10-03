// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cldDelete, cldGet, cldJson, cldPost, cldPut, parseCreds } from './client.js';

const credField = z
  .string()
  .optional()
  .describe(
    'Injected Cloudinary credentials JSON {cloudName, apiKey, apiSecret} — match manifest tokenField',
  );

export const cloudinaryGetRootFolders = tool({
  description: 'List top-level asset folders in the product environment.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    maxResults: z.number().int().min(1).max(500).optional().describe('Max folders to return'),
    nextCursor: z.string().optional().describe('Pagination cursor'),
  }),
  execute: ({ cloudinaryCredentials, maxResults, nextCursor }) =>
    cldGet(parseCreds(cloudinaryCredentials), '/folders', {
      max_results: maxResults,
      next_cursor: nextCursor,
    }),
});

export const cloudinaryShowFolder = tool({
  description: 'List subfolders inside a folder to explore the hierarchy.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    folder: z.string().describe('Folder path, e.g. "product/test"'),
    maxResults: z.number().int().min(1).max(500).optional().describe('Max subfolders to return'),
    nextCursor: z.string().optional().describe('Pagination cursor'),
  }),
  execute: ({ cloudinaryCredentials, folder, maxResults, nextCursor }) =>
    cldGet(parseCreds(cloudinaryCredentials), `/folders/${encodeURIComponent(folder)}`, {
      max_results: maxResults,
      next_cursor: nextCursor,
    }),
});

export const cloudinaryCreateFolder = tool({
  description:
    'Create a new asset folder path (nested paths allowed). Check it does not exist first.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    folder: z.string().describe('Full folder path, e.g. "images/events/2023"'),
  }),
  execute: ({ cloudinaryCredentials, folder }) =>
    cldPost(parseCreds(cloudinaryCredentials), `/folders/${encodeURIComponent(folder)}`),
});

export const cloudinaryUpdateFolder = tool({
  description: 'Rename or move an asset folder by changing its full path.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    folder: z.string().describe('Current folder path, e.g. "product/test"'),
    toFolder: z.string().describe('New path; change the last part to rename, the prefix to move'),
  }),
  execute: ({ cloudinaryCredentials, folder, toFolder }) =>
    cldPut(parseCreds(cloudinaryCredentials), `/folders/${encodeURIComponent(folder)}`, {
      to_folder: toFolder,
    }),
});

export const cloudinaryDeleteFolder = tool({
  description:
    'Delete a folder. It must be empty unless skip_backup keeps backed-up assets deletable.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    folder: z.string().describe('Folder path to delete'),
    skipBackup: z.boolean().optional().describe('Delete even if it contains backed-up assets'),
  }),
  execute: ({ cloudinaryCredentials, folder, skipBackup }) =>
    cldDelete(parseCreds(cloudinaryCredentials), `/folders/${encodeURIComponent(folder)}`, {
      skip_backup: skipBackup,
    }),
});

export const cloudinarySearchFolders = tool({
  description: 'Search folders by name, path, or creation date with a Lucene-like expression.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    expression: z.string().optional().describe('Filter, e.g. "name:sample AND path:events"'),
    sortBy: z
      .array(z.record(z.string()))
      .optional()
      .describe('Sort, e.g. [{created_at:"desc"}] (name, path, created_at)'),
    maxResults: z
      .number()
      .int()
      .min(1)
      .max(500)
      .optional()
      .describe('Max folders to return (default 50)'),
    nextCursor: z.string().optional().describe('Pagination cursor'),
  }),
  execute: ({ cloudinaryCredentials, expression, sortBy, maxResults, nextCursor }) =>
    cldJson(parseCreds(cloudinaryCredentials), 'POST', '/folders/search', {
      expression,
      sort_by: sortBy,
      max_results: maxResults,
      next_cursor: nextCursor,
    }),
});
