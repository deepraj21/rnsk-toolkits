// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { graphRequest, driveBase, failedResult, toSharePointError } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const siteIdField = z.string().describe('SharePoint site ID — get it from sharepointSearchSites');
const driveIdField = z
  .string()
  .optional()
  .describe("Document library ID for a non-default library (default is the site's default library)");
const itemIdField = z.string().describe('Drive item ID — get it from sharepointListFiles or sharepointGetFile');

export const sharepointCreateShareLink = tool({
  description:
    'Create a sharing link for a file or folder and return its web URL. Choose view or edit access and organization or anonymous scope.',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    driveId: driveIdField,
    itemId: itemIdField,
    type: z
      .enum(['view', 'edit'])
      .optional()
      .describe('Link capability: view (read-only, default) or edit'),
    scope: z
      .enum(['anonymous', 'organization', 'users'])
      .optional()
      .describe('Who can use the link: organization (tenant members, default), anonymous (anyone), users (specific people)'),
    expirationDateTime: z
      .string()
      .optional()
      .describe('Link expiry as ISO 8601, e.g. 2026-12-31T00:00:00Z'),
  }),
  execute: async ({ sharepointToken, siteId, driveId, itemId, type, scope, expirationDateTime }) => {
    try {
      const base = driveBase(siteId, driveId);
      const result = await graphRequest(sharepointToken, `${base}/items/${itemId}/createLink`, {
        method: 'POST',
        body: {
          type: type ?? 'view',
          ...(scope ? { scope } : {}),
          ...(expirationDateTime ? { expirationDateTime } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create sharing link', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error creating sharing link');
    }
  },
});

export const sharepointListFilePermissions = tool({
  description:
    'List who has access to a file or folder: inherited permissions, sharing links, and direct grants with their roles.',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    driveId: driveIdField,
    itemId: itemIdField,
  }),
  execute: async ({ sharepointToken, siteId, driveId, itemId }) => {
    try {
      const base = driveBase(siteId, driveId);
      const result = await graphRequest(sharepointToken, `${base}/items/${itemId}/permissions`);
      if (!result.ok) return failedResult('Failed to list permissions', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error listing permissions');
    }
  },
});

export const sharepointGrantFilePermission = tool({
  description:
    'Grant specific people access to a file or folder by email — read or write — without creating a general sharing link.',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    driveId: driveIdField,
    itemId: itemIdField,
    emails: z.array(z.string()).min(1).describe('Recipient email addresses'),
    roles: z
      .array(z.string())
      .optional()
      .describe('Roles to grant: read (default), write, or fullControl'),
  }),
  execute: async ({ sharepointToken, siteId, driveId, itemId, emails, roles }) => {
    try {
      const base = driveBase(siteId, driveId);
      const result = await graphRequest(sharepointToken, `${base}/items/${itemId}/permissions`, {
        method: 'POST',
        body: {
          recipients: emails.map((email) => ({ email })),
          roles: roles && roles.length > 0 ? roles : ['read'],
        },
      });
      if (!result.ok) return failedResult('Failed to grant access', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error granting access');
    }
  },
});

export const sharepointRevokeFilePermission = tool({
  description:
    'Remove a specific permission (direct grant or sharing link) from a file or folder. Only non-inherited permissions can be revoked.',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    driveId: driveIdField,
    itemId: itemIdField,
    permissionId: z.string().describe('Permission ID — get it from sharepointListFilePermissions'),
  }),
  execute: async ({ sharepointToken, siteId, driveId, itemId, permissionId }) => {
    try {
      const base = driveBase(siteId, driveId);
      const result = await graphRequest(
        sharepointToken,
        `${base}/items/${itemId}/permissions/${permissionId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to revoke permission', result);
      return result.data ?? { revoked: true };
    } catch (error) {
      return toSharePointError(error, 'Error revoking permission');
    }
  },
});

export const sharepointListFileVersions = tool({
  description:
    'List version history of a file: version IDs, editors, timestamps, and sizes (newest first) for audit or restore workflows.',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    driveId: driveIdField,
    itemId: itemIdField,
  }),
  execute: async ({ sharepointToken, siteId, driveId, itemId }) => {
    try {
      const base = driveBase(siteId, driveId);
      const result = await graphRequest(sharepointToken, `${base}/items/${itemId}/versions`);
      if (!result.ok) return failedResult('Failed to list file versions', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error listing file versions');
    }
  },
});
