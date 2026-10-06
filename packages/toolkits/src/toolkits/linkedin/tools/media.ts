// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { linkedInRequest, missingToken, normalizeUrn, toLinkedInError } from './client.js';

const authField = {
  linkedinToken: z.string().optional().describe('Injected by system; do not provide'),
};

const ownerField = z
  .string()
  .describe(
    "Owner URN that will own the media: 'urn:li:person:{id}' or 'urn:li:organization:{id}'",
  );

export const linkedinInitializeImageUpload = tool({
  description:
    'Start an image upload and get a presigned upload URL plus image URN. After calling, PUT the image bytes to uploadUrl, then use the image URN in linkedinCreatePost. Required first step for image posts.',
  inputSchema: z.object({
    ...authField,
    owner: ownerField,
  }),
  execute: async ({ linkedinToken, owner }) => {
    try {
      if (!linkedinToken) return missingToken();
      return await linkedInRequest(linkedinToken, '/rest/images?action=initializeUpload', {
        body: { initializeUploadRequest: { owner } },
      });
    } catch (error) {
      return toLinkedInError(error, 'Failed to initialize image upload');
    }
  },
});

export const linkedinRegisterImageUpload = tool({
  description:
    'Register an image upload via the legacy Assets API and get an upload URL plus digital media asset URN. PUT image bytes to the returned uploadUrl, then reference the asset URN in a UGC share.',
  inputSchema: z.object({
    ...authField,
    ownerUrn: ownerField,
    recipe: z
      .string()
      .optional()
      .describe("Processing recipe URN (default 'urn:li:digitalmediaRecipe:feedshare-image')"),
    supportedUploadMechanism: z
      .array(z.string())
      .optional()
      .describe("Upload mechanisms, e.g. ['SYNCHRONOUS_UPLOAD']. Omit for LinkedIn default"),
  }),
  execute: async ({ linkedinToken, ownerUrn, recipe, supportedUploadMechanism }) => {
    try {
      if (!linkedinToken) return missingToken();
      return await linkedInRequest(linkedinToken, '/v2/assets?action=registerUpload', {
        body: {
          registerUploadRequest: {
            recipes: [recipe ?? 'urn:li:digitalmediaRecipe:feedshare-image'],
            owner: ownerUrn,
            serviceRelationships: [
              { relationshipType: 'OWNER', identifier: 'urn:li:userGeneratedContent' },
            ],
            ...(supportedUploadMechanism !== undefined ? { supportedUploadMechanism } : {}),
          },
        },
      });
    } catch (error) {
      return toLinkedInError(error, 'Failed to register image upload');
    }
  },
});

export const linkedinGetImage = tool({
  description:
    'Get metadata for a single LinkedIn image: status, download URL, dimensions. Use to check an upload is ready before attaching it to a post.',
  inputSchema: z.object({
    ...authField,
    imageUrn: z.string().describe("Image URN 'urn:li:image:XXX' or bare ID 'XXX'"),
  }),
  execute: async ({ linkedinToken, imageUrn }) => {
    try {
      if (!linkedinToken) return missingToken();
      const urn = normalizeUrn(imageUrn, 'image');
      return await linkedInRequest(linkedinToken, `/rest/images/${encodeURIComponent(urn)}`);
    } catch (error) {
      return toLinkedInError(error, 'Failed to get image');
    }
  },
});

export const linkedinGetImages = tool({
  description:
    'Batch-fetch metadata (status, download URLs, dimensions) for multiple LinkedIn images in one call. Use for media library or post-asset inventories.',
  inputSchema: z.object({
    ...authField,
    ids: z
      .array(z.string())
      .min(1)
      .describe("Image URNs, e.g. ['urn:li:image:C4E10AQFn10iWtKexVA']. Accepts bare IDs too"),
  }),
  execute: async ({ linkedinToken, ids }) => {
    try {
      if (!linkedinToken) return missingToken();
      const list = `List(${ids.map((id) => encodeURIComponent(normalizeUrn(id, 'image'))).join(',')})`;
      return await linkedInRequest(linkedinToken, `/rest/images?ids=${list}`);
    } catch (error) {
      return toLinkedInError(error, 'Failed to get images');
    }
  },
});

export const linkedinGetVideos = tool({
  description:
    'Get LinkedIn video metadata: duration, dimensions, status, download URLs, media library info. Fetch one video by URN or batch multiple by IDs.',
  inputSchema: z.object({
    ...authField,
    videoUrn: z
      .string()
      .optional()
      .describe("Single video URN, e.g. 'urn:li:video:C4E10AQGUkQY7trgh-Q'"),
    videoIds: z
      .array(z.string())
      .optional()
      .describe('Multiple video URNs for batch retrieval. Mutually exclusive with videoUrn'),
  }),
  execute: async ({ linkedinToken, videoUrn, videoIds }) => {
    try {
      if (!linkedinToken) return missingToken();
      if (videoUrn !== undefined) {
        const urn = normalizeUrn(videoUrn, 'video');
        return await linkedInRequest(linkedinToken, `/rest/videos/${encodeURIComponent(urn)}`);
      }
      if (videoIds !== undefined && videoIds.length > 0) {
        const list = `List(${videoIds.map((id) => encodeURIComponent(normalizeUrn(id, 'video'))).join(',')})`;
        return await linkedInRequest(linkedinToken, `/rest/videos?ids=${list}`);
      }
      return { error: 'Provide videoUrn for a single video or videoIds for batch retrieval.' };
    } catch (error) {
      return toLinkedInError(error, 'Failed to get videos');
    }
  },
});

async function resolveVideoBytes(videoUrl?: string, fileData?: string) {
  if (fileData !== undefined) {
    const match = fileData.match(/^data:([^;]+);base64,(.+)$/s);
    if (!match)
      return {
        error:
          'fileData must be a base64 data: URL (S3 keys cannot be resolved here; use videoUrl instead).',
      };
    return { bytes: Buffer.from(match[2], 'base64'), contentType: match[1] };
  }
  if (videoUrl !== undefined) {
    const res = await fetch(videoUrl);
    if (!res.ok) return { error: `Failed to download video from URL (HTTP ${res.status}).` };
    const buf = Buffer.from(await res.arrayBuffer());
    return { bytes: buf, contentType: res.headers.get('content-type') ?? 'video/mp4' };
  }
  return { error: 'Provide videoUrl (public MP4 URL) or fileData (base64 data: URL).' };
}

export const linkedinUploadVideo = tool({
  description:
    'Upload an MP4 video from a public URL and wait until LinkedIn finishes processing. Returns the ready video URN for linkedinCreateVideoPost. Full flow handled: initialize, binary PUT, finalize, status polling.',
  inputSchema: z.object({
    ...authField,
    videoUrl: z
      .string()
      .optional()
      .describe('Public HTTP/HTTPS URL of an MP4 video. Provide this or fileData, not both'),
    fileData: z
      .string()
      .optional()
      .describe(
        'Base64 data: URL of the MP4 bytes (self-hosted file input). Provide this or videoUrl, not both',
      ),
    title: z
      .string()
      .optional()
      .describe('Title stored alongside the upload (returned in metadata)'),
  }),
  execute: async ({ linkedinToken, videoUrl, fileData, title }) => {
    try {
      if (!linkedinToken) return missingToken();
      const resolved: any = await resolveVideoBytes(videoUrl, fileData);
      if (resolved.error) return { error: resolved.error };
      const bytes: Buffer = resolved.bytes;

      const me: any = await linkedInRequest(linkedinToken, '/v2/userinfo');
      if (!me?.sub) return { error: 'Could not determine member ID from LinkedIn userinfo.' };
      const owner = `urn:li:person:${me.sub}`;

      const init: any = await linkedInRequest(
        linkedinToken,
        '/rest/videos?action=initializeUpload',
        {
          body: {
            initializeUploadRequest: {
              owner,
              fileSizeBytes: bytes.length,
              uploadCaptions: false,
              uploadThumbnail: false,
            },
          },
        },
      );
      const value = init?.value ?? init;
      const video: string | undefined = value?.video;
      const instructions: any[] = value?.uploadInstructions ?? [];
      const uploadToken: string = value?.uploadToken ?? '';
      if (!video || instructions.length === 0) {
        return { error: 'Failed to initialize video upload', details: init };
      }

      const etags: string[] = [];
      if (
        instructions.length === 1 &&
        (instructions[0].lastByte === undefined || instructions[0].firstByte === 0)
      ) {
        const put = await fetch(instructions[0].uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': resolved.contentType,
            Authorization: `Bearer ${linkedinToken}`,
          },
          body: bytes as any,
        });
        if (!put.ok) return { error: `Video binary upload failed (HTTP ${put.status}).` };
        const etag = put.headers.get('etag');
        if (etag) etags.push(etag);
      } else {
        for (const part of instructions) {
          const chunk = bytes.subarray(
            part.firstByte ?? 0,
            (part.lastByte ?? bytes.length - 1) + 1,
          );
          const put = await fetch(part.uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': resolved.contentType,
              Authorization: `Bearer ${linkedinToken}`,
            },
            body: chunk as any,
          });
          if (!put.ok) return { error: `Video part upload failed (HTTP ${put.status}).` };
          const etag = put.headers.get('etag');
          if (etag) etags.push(etag);
        }
      }

      await linkedInRequest(linkedinToken, '/rest/videos?action=finalizeUpload', {
        body: { finalizeUploadRequest: { video, uploadToken, uploadedPartIds: etags } },
      });

      let status: string | undefined;
      let videoMeta: any = {};
      for (let attempt = 0; attempt < 12; attempt += 1) {
        await new Promise((r) => setTimeout(r, 10000));
        try {
          videoMeta = await linkedInRequest(
            linkedinToken,
            `/rest/videos/${encodeURIComponent(video)}`,
          );
          status = videoMeta?.status;
          if (status === 'AVAILABLE') break;
          if (status === 'PROCESSING_FAILED') {
            return { error: 'LinkedIn video processing failed.', details: videoMeta };
          }
        } catch {
          break;
        }
      }
      return {
        videoUrn: video,
        status: status ?? 'UNKNOWN',
        ...(title !== undefined ? { title } : {}),
        message:
          status === 'AVAILABLE'
            ? 'Video is ready to publish with linkedinCreateVideoPost.'
            : 'Upload finalized; video is still processing. Recheck with linkedinGetVideos.',
      };
    } catch (error) {
      return toLinkedInError(error, 'Failed to upload video');
    }
  },
});
