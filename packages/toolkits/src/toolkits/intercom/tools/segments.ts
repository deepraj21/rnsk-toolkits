// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { intercomRequest, failedResult, toIntercomError } from './client.js';

export const intercomListSegments = tool({
  description: 'List segments for filtering and categorizing contacts.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    includeCount: z.boolean().optional().describe('populate contact counts'),
  }),
  execute: async ({ intercomCredentials, includeCount }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/segments`, {
        method: 'GET',
        query: { includeCount: includeCount },
      });
      if (!result.ok) return failedResult('Failed to list segments', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing segments');
    }
  },
});

export const intercomRetrieveSegment = tool({
  description: 'Fetch a single segment by ID with optional contact count.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    segmentId: z.string(),
    includeCount: z.boolean().optional().describe('user segments only'),
  }),
  execute: async ({ intercomCredentials, segmentId, includeCount }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/segments/${segmentId}`, {
        method: 'GET',
        query: { includeCount: includeCount },
      });
      if (!result.ok) return failedResult('Failed to retrieve segment', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error retrieving segment');
    }
  },
});
