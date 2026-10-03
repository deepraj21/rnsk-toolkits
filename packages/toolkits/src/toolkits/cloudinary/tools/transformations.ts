// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cldDelete, cldGet, cldJson, parseCreds } from './client.js';

const credField = z
  .string()
  .optional()
  .describe(
    'Injected Cloudinary credentials JSON {cloudName, apiKey, apiSecret} — match manifest tokenField',
  );

export const cloudinaryGetTransformations = tool({
  description: 'List named and unnamed transformations with pagination.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    maxResults: z
      .number()
      .int()
      .min(1)
      .max(500)
      .optional()
      .describe('Max transformations to return (default 10)'),
    nextCursor: z.string().optional().describe('Pagination cursor'),
  }),
  execute: ({ cloudinaryCredentials, maxResults, nextCursor }) =>
    cldGet(parseCreds(cloudinaryCredentials), '/transformations', {
      max_results: maxResults,
      next_cursor: nextCursor,
    }),
});

export const cloudinaryGetTransformation = tool({
  description: 'Get a transformation definition with parameters, derived resources, and usage.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    transformation: z
      .string()
      .describe('Named transformation or transformation string, e.g. "w_100,h_150,c_fill"'),
  }),
  execute: ({ cloudinaryCredentials, transformation }) =>
    cldGet(
      parseCreds(cloudinaryCredentials),
      `/transformations/${encodeURIComponent(transformation)}`,
    ),
});

export const cloudinaryCreateTransformation = tool({
  description: 'Save a reusable named transformation for a transformation string.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    name: z.string().describe('Custom name, e.g. "small_profile_thumbnail"'),
    transformation: z.string().describe('Transformation string, e.g. "w_100,h_150,c_fill,g_auto"'),
    allowedForStrict: z.boolean().optional().describe('Allow under strict-transformations mode'),
  }),
  execute: ({ cloudinaryCredentials, name, transformation, allowedForStrict }) =>
    cldJson(parseCreds(cloudinaryCredentials), 'POST', '/transformations', {
      name,
      transformation,
      allowed_for_strict: allowedForStrict,
    }),
});

export const cloudinaryUpdateTransformation = tool({
  description: 'Update a named transformation definition or its strict-mode allowance.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    transformation: z.string().describe('Named transformation or transformation string to update'),
    unsafeUpdate: z
      .string()
      .optional()
      .describe('New transformation definition (applies to newly generated derived assets)'),
    allowedForStrict: z.boolean().optional().describe('Allow under strict-transformations mode'),
  }),
  execute: ({ cloudinaryCredentials, transformation, unsafeUpdate, allowedForStrict }) =>
    cldJson(
      parseCreds(cloudinaryCredentials),
      'PUT',
      `/transformations/${encodeURIComponent(transformation)}`,
      {
        unsafe_update: unsafeUpdate,
        allowed_for_strict: allowedForStrict,
      },
    ),
});

export const cloudinaryDeleteTransformation = tool({
  description: 'Delete a named transformation, optionally invalidating derived CDN copies.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    transformation: z.string().describe('Named transformation or transformation string to delete'),
    invalidate: z
      .boolean()
      .optional()
      .describe('Clear derived CDN copies using this transformation'),
  }),
  execute: ({ cloudinaryCredentials, transformation, invalidate }) =>
    cldDelete(
      parseCreds(cloudinaryCredentials),
      `/transformations/${encodeURIComponent(transformation)}`,
      {
        invalidate,
      },
    ),
});

export const cloudinaryGetStreamingProfiles = tool({
  description: 'List built-in and custom adaptive streaming profiles for HLS/DASH delivery.',
  inputSchema: z.object({ cloudinaryCredentials: credField }),
  execute: ({ cloudinaryCredentials }) =>
    cldGet(parseCreds(cloudinaryCredentials), '/streaming_profiles'),
});

export const cloudinaryGetStreamingProfileDetails = tool({
  description: 'Inspect one streaming profile representations before changing it.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    name: z.string().describe('Profile name, e.g. "hd"'),
  }),
  execute: ({ cloudinaryCredentials, name }) =>
    cldGet(parseCreds(cloudinaryCredentials), `/streaming_profiles/${encodeURIComponent(name)}`),
});

const representationsField = z
  .string()
  .describe(
    'JSON-stringified representations, e.g. \'[{"transformation":"w_1920,h_1080,c_limit,vc_h264,br_5m"}]\'',
  );

export const cloudinaryCreateStreamingProfile = tool({
  description: 'Create a custom adaptive-bitrate streaming profile with multiple renditions.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    name: z.string().describe('Unique profile name, e.g. "hd_1080p"'),
    representations: representationsField,
    displayName: z.string().optional().describe('Human-readable display name'),
  }),
  execute: ({ cloudinaryCredentials, name, representations, displayName }) =>
    cldJson(parseCreds(cloudinaryCredentials), 'POST', '/streaming_profiles', {
      name,
      representations,
      display_name: displayName,
    }),
});

export const cloudinaryUpdateStreamingProfile = tool({
  description: 'Update an existing streaming profile representations and display name.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    name: z.string().describe('Profile name to update'),
    representations: representationsField,
    displayName: z.string().optional().describe('Human-readable display name'),
  }),
  execute: ({ cloudinaryCredentials, name, representations, displayName }) =>
    cldJson(
      parseCreds(cloudinaryCredentials),
      'PUT',
      `/streaming_profiles/${encodeURIComponent(name)}`,
      {
        representations,
        display_name: displayName,
      },
    ),
});

export const cloudinaryDeleteStreamingProfile = tool({
  description: 'Delete a custom profile (built-in profiles revert to original settings).',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    name: z.string().describe('Profile name to delete or revert'),
  }),
  execute: ({ cloudinaryCredentials, name }) =>
    cldDelete(parseCreds(cloudinaryCredentials), `/streaming_profiles/${encodeURIComponent(name)}`),
});
