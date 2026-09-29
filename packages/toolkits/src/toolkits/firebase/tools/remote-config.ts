// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { fbRequest, getProjectId } from './client.js';

const BASE = 'https://firebaseremoteconfig.googleapis.com/v1';
const cred = () => z.string().describe('Firebase credentials JSON (projectId, serviceAccountKey)');

function err(label: string, error: unknown) {
  if ((error as any)?.details !== undefined) return error;
  return { error: label, message: error instanceof Error ? error.message : 'Unknown error' };
}

export const firebaseGetRemoteConfig = tool({
  description:
    'Get the active Remote Config template (parameters, conditions). Response includes the ETag needed for publish.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    projectId: z.string().optional().describe('Defaults to the connected project'),
  }),
  execute: async ({ firebaseCredentials, projectId }) => {
    try {
      const pid = projectId ?? getProjectId(firebaseCredentials);
      return await fbRequest(firebaseCredentials, `${BASE}/projects/${pid}/remoteConfig`);
    } catch (error) {
      return err('Failed to get Remote Config template', error);
    }
  },
});

export const firebasePublishRemoteConfig = tool({
  description:
    'Publish a Remote Config template. Pass the ETag from getRemoteConfig (or "*" to force). Set validateOnly to check without publishing.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    template: z
      .record(z.any())
      .describe('Full RemoteConfig template object (parameters, conditions, version)'),
    etag: z.string().describe('ETag from the last GET, or "*" to force-overwrite'),
    validateOnly: z.boolean().optional().describe('Validate the template without publishing'),
    projectId: z.string().optional().describe('Defaults to the connected project'),
  }),
  execute: async ({ firebaseCredentials, template, etag, validateOnly, projectId }) => {
    try {
      const pid = projectId ?? getProjectId(firebaseCredentials);
      return await fbRequest(firebaseCredentials, `${BASE}/projects/${pid}/remoteConfig`, {
        method: 'PUT',
        query: validateOnly ? { validate_only: 'true' } : undefined,
        headers: { 'If-Match': etag },
        body: template,
      });
    } catch (error) {
      return err('Failed to publish Remote Config template', error);
    }
  },
});

export const firebaseListRemoteConfigVersions = tool({
  description: 'List published Remote Config template versions, newest first.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    pageSize: z.number().optional().describe('Max versions to return'),
    pageToken: z.string().optional().describe('Page token from a previous response'),
    projectId: z.string().optional().describe('Defaults to the connected project'),
  }),
  execute: async ({ firebaseCredentials, pageSize, pageToken, projectId }) => {
    try {
      const pid = projectId ?? getProjectId(firebaseCredentials);
      return await fbRequest(
        firebaseCredentials,
        `${BASE}/projects/${pid}/remoteConfig:listVersions`,
        {
          query: { page_size: pageSize, page_token: pageToken },
        },
      );
    } catch (error) {
      return err('Failed to list Remote Config versions', error);
    }
  },
});

export const firebaseRollbackRemoteConfig = tool({
  description: 'Roll back the Remote Config template to a previous version number.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    versionNumber: z
      .string()
      .describe('Version number to roll back to (see listRemoteConfigVersions)'),
    projectId: z.string().optional().describe('Defaults to the connected project'),
  }),
  execute: async ({ firebaseCredentials, versionNumber, projectId }) => {
    try {
      const pid = projectId ?? getProjectId(firebaseCredentials);
      return await fbRequest(firebaseCredentials, `${BASE}/projects/${pid}/remoteConfig:rollback`, {
        method: 'POST',
        body: { version_number: versionNumber },
      });
    } catch (error) {
      return err('Failed to roll back Remote Config', error);
    }
  },
});
