// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { compact, typeformRequest } from './client.js';

export const typeformListVideos = tool({
  description:
    'Fetches videos attached to a form with their transcode status, duration, and preview URLs — optionally request instant clips by giving start/end times per video, or filter by status. Needs the images:read scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    formId: z.string().min(1).describe('Form ID whose videos to fetch'),
    videos: z
      .array(
        z.object({
          id: z.string().describe('Video reference ID'),
          startTime: z.number().optional().describe('Clip start (unit set by clipTimeUnit)'),
          endTime: z.number().optional().describe('Clip end (unit set by clipTimeUnit)'),
        }),
      )
      .min(1)
      .describe('Videos to fetch, with optional clip windows'),
    clipTimeUnit: z
      .enum(['s', 'ms'])
      .optional()
      .describe('Unit for start/end times: "s" seconds (default) or "ms" milliseconds'),
    status: z
      .enum(['ready', 'processing', 'upload_pending'])
      .optional()
      .describe('Only return videos with this transcode status'),
  }),
  execute: async ({ typeformToken, formId, videos, clipTimeUnit, status }) => {
    if (!formId) return { error: 'formId is required.' };
    if (!videos || !videos.length) return { error: 'videos is required (at least one video ID).' };

    const body = compact({
      form_id: formId,
      videos: videos.map((v) =>
        compact({ id: v.id, start_time: v.startTime, end_time: v.endTime }),
      ),
      clip_time_unit: clipTimeUnit,
      status,
    });

    const result = await typeformRequest(typeformToken, '/media/videos/list', {
      method: 'POST',
      body,
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
