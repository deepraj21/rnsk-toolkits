// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { graphRequest, onenoteBase, failedResult, toOneNoteError } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const ownerField = z
  .string()
  .optional()
  .describe('Notebook owner user ID or UPN (default signed-in user)');

export const onenoteListSections = tool({
  description: 'List all sections across notebooks, including ones in nested section groups.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    top: z.number().int().min(1).optional().describe('Sections per page'),
  }),
  execute: async ({ onenoteToken, owner, top }) => {
    try {
      const result = await graphRequest(onenoteToken, `${onenoteBase(owner)}/sections`, {
        query: { $top: top },
      });
      if (!result.ok) return failedResult('Failed to list sections', result);
      return result.data;
    } catch (error) {
      return toOneNoteError(error, 'Error listing sections');
    }
  },
});

export const onenoteGetSection = tool({
  description: 'Get one section with parent notebook/group links and page links.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    sectionId: z.string().describe('Section ID'),
  }),
  execute: async ({ onenoteToken, owner, sectionId }) => {
    try {
      const result = await graphRequest(
        onenoteToken,
        `${onenoteBase(owner)}/sections/${sectionId}`,
      );
      if (!result.ok) return failedResult('Failed to get section', result);
      return result.data;
    } catch (error) {
      return toOneNoteError(error, 'Error getting section');
    }
  },
});

export const onenoteCreateSection = tool({
  description: 'Create a section directly under a notebook.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    notebookId: z.string().describe('Parent notebook ID'),
    displayName: z.string().describe('Section display name'),
  }),
  execute: async ({ onenoteToken, owner, notebookId, displayName }) => {
    try {
      const result = await graphRequest(
        onenoteToken,
        `${onenoteBase(owner)}/notebooks/${notebookId}/sections`,
        { method: 'POST', body: { displayName } },
      );
      if (!result.ok) return failedResult('Failed to create section', result);
      return result.data;
    } catch (error) {
      return toOneNoteError(error, 'Error creating section');
    }
  },
});

export const onenoteUpdateSection = tool({
  description: 'Rename a section.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    sectionId: z.string().describe('Section ID'),
    displayName: z.string().describe('New display name'),
  }),
  execute: async ({ onenoteToken, owner, sectionId, displayName }) => {
    try {
      const result = await graphRequest(
        onenoteToken,
        `${onenoteBase(owner)}/sections/${sectionId}`,
        { method: 'PATCH', body: { displayName } },
      );
      if (!result.ok) return failedResult('Failed to update section', result);
      return result.data;
    } catch (error) {
      return toOneNoteError(error, 'Error updating section');
    }
  },
});

export const onenoteDeleteSection = tool({
  description: 'Delete a section and its pages.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    sectionId: z.string().describe('Section ID'),
  }),
  execute: async ({ onenoteToken, owner, sectionId }) => {
    try {
      const result = await graphRequest(
        onenoteToken,
        `${onenoteBase(owner)}/sections/${sectionId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete section', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toOneNoteError(error, 'Error deleting section');
    }
  },
});

export const onenoteListSectionPages = tool({
  description: 'List page metadata in a section with level/order paging.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    sectionId: z.string().describe('Section ID'),
    top: z.number().int().min(1).optional().describe('Pages per page'),
    pageLevel: z.boolean().optional().describe('Include page level and order'),
  }),
  execute: async ({ onenoteToken, owner, sectionId, top, pageLevel }) => {
    try {
      const result = await graphRequest(
        onenoteToken,
        `${onenoteBase(owner)}/sections/${sectionId}/pages`,
        { query: { $top: top, pagelevel: pageLevel } },
      );
      if (!result.ok) return failedResult('Failed to list section pages', result);
      return result.data;
    } catch (error) {
      return toOneNoteError(error, 'Error listing section pages');
    }
  },
});

export const onenoteCopySectionToNotebook = tool({
  description: 'Copy a section into another notebook, optionally renamed.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    sectionId: z.string().describe('Section ID'),
    notebookId: z.string().describe('Destination notebook ID'),
    groupId: z.string().optional().describe('Destination group ID'),
    renameAs: z.string().optional().describe('New name for the copy'),
  }),
  execute: async ({ onenoteToken, owner, sectionId, notebookId, groupId, renameAs }) => {
    try {
      const result = await graphRequest(
        onenoteToken,
        `${onenoteBase(owner)}/sections/${sectionId}/copyToNotebook`,
        {
          method: 'POST',
          body: {
            id: notebookId,
            ...(groupId !== undefined ? { groupId } : {}),
            ...(renameAs !== undefined ? { renameAs } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to copy section to notebook', result);
      return result.data ?? { copied: true };
    } catch (error) {
      return toOneNoteError(error, 'Error copying section to notebook');
    }
  },
});

export const onenoteCopySectionToSectionGroup = tool({
  description: 'Copy a section into a section group, optionally renamed.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    sectionId: z.string().describe('Section ID'),
    sectionGroupId: z.string().describe('Destination section group ID'),
    renameAs: z.string().optional().describe('New name for the copy'),
  }),
  execute: async ({ onenoteToken, owner, sectionId, sectionGroupId, renameAs }) => {
    try {
      const result = await graphRequest(
        onenoteToken,
        `${onenoteBase(owner)}/sections/${sectionId}/copyToSectionGroup`,
        {
          method: 'POST',
          body: {
            id: sectionGroupId,
            ...(renameAs !== undefined ? { renameAs } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to copy section to section group', result);
      return result.data ?? { copied: true };
    } catch (error) {
      return toOneNoteError(error, 'Error copying section to section group');
    }
  },
});

export const onenoteListPages = tool({
  description:
    'List page metadata across notebooks (default newest-first, 20 per page). Supports full-text $search.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    search: z.string().optional().describe('Full-text search on title and content'),
    filter: z.string().optional().describe('OData filter'),
    orderBy: z.string().optional().describe('Order, e.g. lastModifiedDateTime desc'),
    top: z.number().int().min(1).max(100).optional().describe('Pages per page (max 100)'),
  }),
  execute: async ({ onenoteToken, owner, search, filter, orderBy, top }) => {
    try {
      const result = await graphRequest(onenoteToken, `${onenoteBase(owner)}/pages`, {
        query: { $search: search, $filter: filter, $orderby: orderBy, $top: top },
      });
      if (!result.ok) return failedResult('Failed to list pages', result);
      return result.data;
    } catch (error) {
      return toOneNoteError(error, 'Error listing pages');
    }
  },
});

export const onenoteGetPage = tool({
  description: 'Get one page metadata with links and parent section/notebook.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    pageId: z.string().describe('Page ID'),
  }),
  execute: async ({ onenoteToken, owner, pageId }) => {
    try {
      const result = await graphRequest(onenoteToken, `${onenoteBase(owner)}/pages/${pageId}`);
      if (!result.ok) return failedResult('Failed to get page', result);
      return result.data;
    } catch (error) {
      return toOneNoteError(error, 'Error getting page');
    }
  },
});

export const onenoteGetPageContent = tool({
  description:
    'Get the HTML content of a page. Use includeIDs to fetch generated element IDs for updates.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    pageId: z.string().describe('Page ID'),
    includeIDs: z.boolean().optional().describe('Include generated element IDs for PATCH updates'),
  }),
  execute: async ({ onenoteToken, owner, pageId, includeIDs }) => {
    try {
      if (!onenoteToken) {
        return {
          error: 'Failed to get page content',
          statusCode: 401,
          details: { error: 'OneNote token is required. Connect OneNote first.' },
        };
      }
      const url = new URL(
        `https://graph.microsoft.com/v1.0${onenoteBase(owner)}/pages/${pageId}/content`,
      );
      if (includeIDs === true) url.searchParams.set('includeIDs', 'true');
      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${onenoteToken}` },
      });
      if (!response.ok) {
        const details = await response.json().catch(() => null);
        return { error: 'Failed to get page content', statusCode: response.status, details };
      }
      return { html: await response.text() };
    } catch (error) {
      return toOneNoteError(error, 'Error getting page content');
    }
  },
});

export const onenoteGetPagePreview = tool({
  description: 'Get text and image preview of a page for quick skimming.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    pageId: z.string().describe('Page ID'),
  }),
  execute: async ({ onenoteToken, owner, pageId }) => {
    try {
      const result = await graphRequest(
        onenoteToken,
        `${onenoteBase(owner)}/pages/${pageId}/preview`,
      );
      if (!result.ok) return failedResult('Failed to get page preview', result);
      return result.data;
    } catch (error) {
      return toOneNoteError(error, 'Error getting page preview');
    }
  },
});

export const onenoteCreatePage = tool({
  description:
    'Create a page in a section from HTML (title, text, tables, images via data URLs). Returns the new page.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    sectionId: z.string().describe('Parent section ID'),
    html: z
      .string()
      .describe(
        'Page HTML, e.g. "<!DOCTYPE html><html><head><title>T</title></head><body><p>Hi</p></body></html>"',
      ),
  }),
  execute: async ({ onenoteToken, owner, sectionId, html }) => {
    try {
      const result = await graphRequest(
        onenoteToken,
        `${onenoteBase(owner)}/sections/${sectionId}/pages`,
        { method: 'POST', rawBody: html },
      );
      if (!result.ok) return failedResult('Failed to create page', result);
      return result.data;
    } catch (error) {
      return toOneNoteError(error, 'Error creating page');
    }
  },
});

export const onenoteUpdatePageContent = tool({
  description:
    'Update page content with JSON change objects: target element (title/body/data-id/generated id), action (append/replace/insert), position, and HTML content.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    pageId: z.string().describe('Page ID'),
    changes: z
      .array(z.record(z.string(), z.any()))
      .min(1)
      .describe(
        'Change objects [{target, action: append|replace|insert, position?: before|after, content}]',
      ),
  }),
  execute: async ({ onenoteToken, owner, pageId, changes }) => {
    try {
      const result = await graphRequest(
        onenoteToken,
        `${onenoteBase(owner)}/pages/${pageId}/content`,
        { method: 'PATCH', body: changes },
      );
      if (!result.ok) return failedResult('Failed to update page content', result);
      return result.data ?? { updated: true };
    } catch (error) {
      return toOneNoteError(error, 'Error updating page content');
    }
  },
});

export const onenoteDeletePage = tool({
  description: 'Delete a page.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    pageId: z.string().describe('Page ID'),
  }),
  execute: async ({ onenoteToken, owner, pageId }) => {
    try {
      const result = await graphRequest(onenoteToken, `${onenoteBase(owner)}/pages/${pageId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete page', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toOneNoteError(error, 'Error deleting page');
    }
  },
});

export const onenoteCopyPageToSection = tool({
  description: 'Copy a page into another section.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    pageId: z.string().describe('Page ID'),
    sectionId: z.string().describe('Destination section ID'),
    groupId: z.string().optional().describe('Destination group ID'),
  }),
  execute: async ({ onenoteToken, owner, pageId, sectionId, groupId }) => {
    try {
      const result = await graphRequest(
        onenoteToken,
        `${onenoteBase(owner)}/pages/${pageId}/copyToSection`,
        {
          method: 'POST',
          body: {
            id: sectionId,
            ...(groupId !== undefined ? { groupId } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to copy page to section', result);
      return result.data ?? { copied: true };
    } catch (error) {
      return toOneNoteError(error, 'Error copying page to section');
    }
  },
});

export const onenoteGetPageParentSection = tool({
  description: 'Get the parent section of a page.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    pageId: z.string().describe('Page ID'),
  }),
  execute: async ({ onenoteToken, owner, pageId }) => {
    try {
      const result = await graphRequest(
        onenoteToken,
        `${onenoteBase(owner)}/pages/${pageId}/parentSection`,
      );
      if (!result.ok) return failedResult('Failed to get parent section', result);
      return result.data;
    } catch (error) {
      return toOneNoteError(error, 'Error getting parent section');
    }
  },
});

export const onenoteGetPageParentNotebook = tool({
  description: 'Get the parent notebook of a page.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    pageId: z.string().describe('Page ID'),
  }),
  execute: async ({ onenoteToken, owner, pageId }) => {
    try {
      const result = await graphRequest(
        onenoteToken,
        `${onenoteBase(owner)}/pages/${pageId}/parentNotebook`,
      );
      if (!result.ok) return failedResult('Failed to get parent notebook', result);
      return result.data;
    } catch (error) {
      return toOneNoteError(error, 'Error getting parent notebook');
    }
  },
});

export const onenoteGetResource = tool({
  description: 'Get metadata of an image or file resource embedded in a page.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    resourceId: z.string().describe('Resource ID'),
  }),
  execute: async ({ onenoteToken, owner, resourceId }) => {
    try {
      const result = await graphRequest(
        onenoteToken,
        `${onenoteBase(owner)}/resources/${resourceId}`,
      );
      if (!result.ok) return failedResult('Failed to get resource', result);
      return result.data;
    } catch (error) {
      return toOneNoteError(error, 'Error getting resource');
    }
  },
});

export const onenoteGetResourceContent = tool({
  description: 'Download the binary content of an image or file resource as base64.',
  inputSchema: z.object({
    onenoteToken: tokenField,
    owner: ownerField,
    resourceId: z.string().describe('Resource ID'),
  }),
  execute: async ({ onenoteToken, owner, resourceId }) => {
    try {
      if (!onenoteToken) {
        return {
          error: 'Failed to get resource content',
          statusCode: 401,
          details: { error: 'OneNote token is required. Connect OneNote first.' },
        };
      }
      const response = await fetch(
        `https://graph.microsoft.com/v1.0${onenoteBase(owner)}/resources/${resourceId}/$value`,
        { headers: { Authorization: `Bearer ${onenoteToken}` } },
      );
      if (!response.ok) {
        const details = await response.json().catch(() => null);
        return { error: 'Failed to get resource content', statusCode: response.status, details };
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      return {
        contentType: response.headers.get('content-type') ?? 'application/octet-stream',
        size: buffer.length,
        contentBase64: buffer.toString('base64'),
      };
    } catch (error) {
      return toOneNoteError(error, 'Error getting resource content');
    }
  },
});
