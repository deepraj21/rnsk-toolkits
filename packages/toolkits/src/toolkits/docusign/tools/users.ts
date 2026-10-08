// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { docusignRequest, failedResult, toDocusignError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const docusignListUsers = tool({
  description: 'List users in the account.',
  inputSchema: z.object({
    docusignCredentials: credField,
    count: z.number().int().optional(),
    startPosition: z.number().int().optional(),
    status: z.string().optional().describe('e.g. Active, ActivationSent'),
    email: z.string().optional(),
  }),
  execute: async ({ docusignCredentials, count, startPosition, status, email }) => {
    try {
      const result = await docusignRequest(docusignCredentials, '/users', {
        query: { count, start_position: startPosition, status, email },
      });
      if (!result.ok) return failedResult('Failed to list users', result);
      return result.data;
    } catch (error) {
      return toDocusignError(error, 'Error listing users');
    }
  },
});

export const docusignGetUser = tool({
  description: 'Get a user by ID.',
  inputSchema: z.object({
    docusignCredentials: credField,
    userId: z.string().describe('User ID'),
  }),
  execute: async ({ docusignCredentials, userId }) => {
    try {
      const result = await docusignRequest(
        docusignCredentials,
        `/users/${encodeURIComponent(userId)}`,
      );
      if (!result.ok) return failedResult('Failed to get user', result);
      return result.data;
    } catch (error) {
      return toDocusignError(error, 'Error getting user');
    }
  },
});
