// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { xRequest, failedResult, toXError } from './client.js';

const tokenField = z.string().optional().describe('X OAuth 2.0 access token (injected by system)');
const mediaCategoryField = z
  .string()
  .optional()
  .describe(
    'tweet_image, tweet_video, tweet_gif, dm_image, dm_video, dm_gif, amplify_video, or subtitles',
  );

export const xInitMediaUpload = tool({
  description:
    'Initialize a chunked media upload session. Returns a media ID for append and finalize steps. Required for videos, GIFs, and files over 5MB.',
  inputSchema: z.object({
    xToken: tokenField,
    mediaType: z.string().describe('MIME type, e.g. video/mp4, image/png, image/jpeg, image/gif'),
    totalBytes: z.number().int().min(0).describe('Total media file size in bytes'),
    mediaCategory: mediaCategoryField,
    shared: z.boolean().optional().describe('Whether the media is shared'),
    additionalOwners: z.array(z.string()).optional().describe('Additional owner user IDs'),
  }),
  execute: async ({ xToken, mediaType, totalBytes, mediaCategory, shared, additionalOwners }) => {
    try {
      const result = await xRequest(xToken, '/media/upload/initialize', {
        method: 'POST',
        body: {
          media_type: mediaType,
          total_bytes: totalBytes,
          ...(mediaCategory ? { media_category: mediaCategory } : {}),
          ...(shared !== undefined ? { shared } : {}),
          ...(additionalOwners ? { additional_owners: additionalOwners } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to initialize media upload', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error initializing media upload');
    }
  },
});

export const xAppendMediaUpload = tool({
  description:
    'Append a base64-encoded media chunk to an upload session. Repeat with incrementing segment indexes starting at 0.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('Media ID from the initialize step'),
    media: z.string().describe('Base64-encoded media chunk (max ~5MB of media per chunk)'),
    segmentIndex: z
      .number()
      .int()
      .min(0)
      .describe('Zero-based segment index; 0 for the first chunk, increment per chunk'),
  }),
  execute: async ({ xToken, id, media, segmentIndex }) => {
    try {
      const result = await xRequest(xToken, `/media/upload/${id}/append`, {
        method: 'POST',
        body: { media, segment_index: segmentIndex },
      });
      if (!result.ok) return failedResult('Failed to append media chunk', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error appending media chunk');
    }
  },
});

export const xMediaUploadStatus = tool({
  description:
    'Get the processing status of uploaded media. Poll every few seconds until state is succeeded before attaching the media ID to a post; failed is terminal and needs a fresh upload.',
  inputSchema: z.object({
    xToken: tokenField,
    mediaId: z.string().describe('Media ID from a previous upload'),
  }),
  execute: async ({ xToken, mediaId }) => {
    try {
      const result = await xRequest(xToken, '/media/upload', {
        query: { media_id: mediaId, command: 'STATUS' },
      });
      if (!result.ok) return failedResult('Failed to get media upload status', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting media upload status');
    }
  },
});

export const xUploadMedia = tool({
  description:
    'Upload a small media file in one request using base64 content. For GIFs, videos, or files over 5MB use the chunked initialize/append/finalize flow instead.',
  inputSchema: z.object({
    xToken: tokenField,
    media: z.string().describe('Base64-encoded media content'),
    mediaType: z.string().optional().describe('MIME type, e.g. image/png, image/jpeg'),
    mediaCategory: mediaCategoryField,
    shared: z.boolean().optional().describe('Whether the media is shared'),
    additionalOwners: z.array(z.string()).optional().describe('Additional owner user IDs'),
  }),
  execute: async ({ xToken, media, mediaType, mediaCategory, shared, additionalOwners }) => {
    try {
      const result = await xRequest(xToken, '/media/upload', {
        method: 'POST',
        body: {
          media,
          ...(mediaType ? { media_type: mediaType } : {}),
          ...(mediaCategory ? { media_category: mediaCategory } : {}),
          ...(shared !== undefined ? { shared } : {}),
          ...(additionalOwners ? { additional_owners: additionalOwners } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to upload media', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error uploading media');
    }
  },
});

export const xUploadLargeMedia = tool({
  description:
    'Upload a large media file (videos, GIFs, images over 5MB) via the full chunked flow: initialize, append chunks, finalize. Returns the finalize response with the media ID.',
  inputSchema: z.object({
    xToken: tokenField,
    media: z.string().describe('Base64-encoded full media content'),
    mediaType: z.string().describe('MIME type, e.g. video/mp4, image/gif, image/png'),
    mediaCategory: z
      .string()
      .optional()
      .describe('tweet_video, tweet_gif, tweet_image, dm_video, etc.'),
    shared: z.boolean().optional().describe('Whether the media is shared'),
    additionalOwners: z.array(z.string()).optional().describe('Additional owner user IDs'),
  }),
  execute: async ({ xToken, media, mediaType, mediaCategory, shared, additionalOwners }) => {
    try {
      const totalBytes = Math.floor((media.length * 3) / 4);
      const init = await xRequest(xToken, '/media/upload/initialize', {
        method: 'POST',
        body: {
          media_type: mediaType,
          total_bytes: totalBytes,
          ...(mediaCategory ? { media_category: mediaCategory } : {}),
          ...(shared !== undefined ? { shared } : {}),
          ...(additionalOwners ? { additional_owners: additionalOwners } : {}),
        },
      });
      if (!init.ok) return failedResult('Failed to initialize large media upload', init);
      const mediaId = init.data?.data?.id ?? init.data?.data?.media_id;
      if (!mediaId) return { error: 'Failed to initialize large media upload', details: init.data };
      const chunkChars = 4 * 1024 * 1024;
      const aligned = chunkChars - (chunkChars % 4);
      let segmentIndex = 0;
      for (let offset = 0; offset < media.length; offset += aligned, segmentIndex += 1) {
        const chunk = media.slice(offset, offset + aligned);
        const appended = await xRequest(xToken, `/media/upload/${mediaId}/append`, {
          method: 'POST',
          body: { media: chunk, segment_index: segmentIndex },
        });
        if (!appended.ok)
          return failedResult(`Failed to append media chunk ${segmentIndex}`, appended);
      }
      const finalized = await xRequest(xToken, `/media/upload/${mediaId}/finalize`, {
        method: 'POST',
      });
      if (!finalized.ok) return failedResult('Failed to finalize large media upload', finalized);
      return finalized.data;
    } catch (error) {
      return toXError(error, 'Error uploading large media');
    }
  },
});
