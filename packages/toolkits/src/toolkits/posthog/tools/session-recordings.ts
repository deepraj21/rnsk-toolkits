// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { posthogRequest } from './client.js';

export const posthogListSessionRecordings = tool({
  description:
    'Lists session recordings (replay) in a project — duration, active time, click/keypress counts, console errors, start URL, and the person who recorded. Returns metadata only (not the raw replay stream). Needs session_recording:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    limit: z.number().int().min(1).optional().describe('Max recordings per page'),
    offset: z.number().int().min(0).optional().describe('Rows to skip for pagination'),
  }),
  execute: async ({ posthogCredentials, projectId, limit, offset }) => {
    if (!projectId) return { error: 'projectId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/session_recordings/`,
      { query: { limit, offset } },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogGetSessionRecording = tool({
  description:
    'Gets one session recording by id — timing, activity metrics, console error counts, start URL, person, and viewed status. Use after posthogListSessionRecordings to inspect a specific replay. Needs session_recording:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    recordingId: z
      .string()
      .min(1)
      .describe('Session recording id (from posthogListSessionRecordings)'),
  }),
  execute: async ({ posthogCredentials, projectId, recordingId }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!recordingId) return { error: 'recordingId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/session_recordings/${encodeURIComponent(recordingId)}/`,
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
