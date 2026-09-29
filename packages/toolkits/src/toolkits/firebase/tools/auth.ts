// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { fbRequest, getProjectId } from './client.js';

const BASE = 'https://identitytoolkit.googleapis.com/v1';
const cred = () => z.string().describe('Firebase credentials JSON (projectId, serviceAccountKey)');
const pidOf = (firebaseCredentials: string, projectId?: string) =>
  projectId ?? getProjectId(firebaseCredentials);

function err(label: string, error: unknown) {
  if ((error as any)?.details !== undefined) return error;
  return { error: label, message: error instanceof Error ? error.message : 'Unknown error' };
}

export const firebaseCreateUser = tool({
  description: 'Create a Firebase Auth user (email/password, phone, or anonymous). Admin request.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    email: z.string().optional().describe('User email'),
    password: z.string().optional().describe('User password (min 6 chars for email users)'),
    phoneNumber: z.string().optional().describe('Phone number in E.164 format'),
    displayName: z.string().optional().describe('Display name'),
    photoUrl: z.string().optional().describe('Photo URL'),
    emailVerified: z.boolean().optional().describe('Mark email as verified'),
    disabled: z.boolean().optional().describe('Disable the account on creation'),
    projectId: z.string().optional().describe('Defaults to the connected project'),
  }),
  execute: async ({ firebaseCredentials, projectId, ...user }) => {
    try {
      return await fbRequest(
        firebaseCredentials,
        `${BASE}/projects/${pidOf(firebaseCredentials, projectId)}/accounts`,
        {
          method: 'POST',
          body: user,
        },
      );
    } catch (error) {
      return err('Failed to create Firebase user', error);
    }
  },
});

export const firebaseLookupUser = tool({
  description: 'Look up Firebase Auth users by UID, email, or phone number.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    localId: z.array(z.string()).optional().describe('User UIDs to look up'),
    email: z.array(z.string()).optional().describe('Emails to look up'),
    phoneNumber: z.array(z.string()).optional().describe('Phone numbers to look up'),
    projectId: z.string().optional().describe('Defaults to the connected project'),
  }),
  execute: async ({ firebaseCredentials, localId, email, phoneNumber, projectId }) => {
    try {
      return await fbRequest(
        firebaseCredentials,
        `${BASE}/projects/${pidOf(firebaseCredentials, projectId)}/accounts:lookup`,
        { method: 'POST', body: { localId, email, phoneNumber } },
      );
    } catch (error) {
      return err('Failed to look up Firebase user', error);
    }
  },
});

export const firebaseListUsers = tool({
  description: 'Download Firebase Auth users in pages (Admin SDK listUsers equivalent).',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    maxResults: z.number().min(1).max(1000).optional().describe('Users per page (max 1000)'),
    nextPageToken: z.string().optional().describe('Page token from a previous response'),
    projectId: z.string().optional().describe('Defaults to the connected project'),
  }),
  execute: async ({ firebaseCredentials, maxResults, nextPageToken, projectId }) => {
    try {
      return await fbRequest(
        firebaseCredentials,
        `${BASE}/projects/${pidOf(firebaseCredentials, projectId)}/accounts:batchGet`,
        { query: { maxResults, nextPageToken } },
      );
    } catch (error) {
      return err('Failed to list Firebase users', error);
    }
  },
});

export const firebaseUpdateUser = tool({
  description:
    'Update a Firebase Auth user (email, password, display name, disable/enable, custom claims).',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    localId: z.string().describe('User UID to update'),
    email: z.string().optional().describe('New email'),
    password: z.string().optional().describe('New password'),
    displayName: z.string().optional().describe('New display name (null clears it)'),
    photoUrl: z.string().optional().describe('New photo URL'),
    emailVerified: z.boolean().optional().describe('Email verified flag'),
    disableUser: z.boolean().optional().describe('True to disable, false to enable'),
    customAttributes: z
      .string()
      .optional()
      .describe('JSON string of custom claims, e.g. {"admin":true}'),
    projectId: z.string().optional().describe('Defaults to the connected project'),
  }),
  execute: async ({ firebaseCredentials, projectId, ...update }) => {
    try {
      return await fbRequest(
        firebaseCredentials,
        `${BASE}/projects/${pidOf(firebaseCredentials, projectId)}/accounts:update`,
        {
          method: 'POST',
          body: { targetProjectId: pidOf(firebaseCredentials, projectId), ...update },
        },
      );
    } catch (error) {
      return err('Failed to update Firebase user', error);
    }
  },
});

export const firebaseDeleteUser = tool({
  description: 'Delete a Firebase Auth user by UID.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    localId: z.string().describe('User UID to delete'),
    projectId: z.string().optional().describe('Defaults to the connected project'),
  }),
  execute: async ({ firebaseCredentials, localId, projectId }) => {
    try {
      return await fbRequest(
        firebaseCredentials,
        `${BASE}/projects/${pidOf(firebaseCredentials, projectId)}/accounts:delete`,
        { method: 'POST', body: { localId } },
      );
    } catch (error) {
      return err('Failed to delete Firebase user', error);
    }
  },
});
