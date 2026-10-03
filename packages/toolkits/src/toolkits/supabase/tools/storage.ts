// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
  buildQuery,
  parseResponse,
  pickDefined,
  resolveApiKey,
  sbDelete,
  sbGet,
  sbHead,
  sbOptions,
  sbPatch,
  sbPost,
  sbPut,
  tusOptions,
} from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const supabaseGetResumableUploadBaseOptions = tool({
  description:
    'Handles OPTIONS request for TUS Resumable uploads to discover server capabilities. Use when preparing resumable upload requests to verify supported TUS protocol versions and extensions. TUS preflight against the project storage host; projectRef is required to target it.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    projectRef: z
      .string()
      .optional()
      .describe(
        'Project ref used to target the project host (e.g. https://<ref>.supabase.co). Required.',
      ),
  }),
  execute: async ({ supabaseAccessToken, projectRef }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    if (!projectRef) return { error: 'projectRef is required to target the project storage host.' };
    return tusOptions(
      supabaseAccessToken,
      `https://${projectRef}.supabase.co/storage/v1/upload/resumable`,
    );
  },
});

export const supabaseGetResumableUploadOptions = tool({
  description:
    'Handles OPTIONS request for TUS Resumable uploads to discover server capabilities. Use when preparing resumable upload requests to verify supported TUS protocol versions and extensions. TUS preflight for one upload resource; projectRef is required to target it.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    wildcard: z
      .string()
      .describe(
        'The wildcard path parameter representing the upload ID or file path for the TUS resumable upload. Used to identify the specific upload resource for CORS preflight requests.',
      ),
    projectRef: z
      .string()
      .optional()
      .describe(
        'Project ref used to target the project host (e.g. https://<ref>.supabase.co). Required.',
      ),
  }),
  execute: async ({ supabaseAccessToken, projectRef, wildcard }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    if (!projectRef) return { error: 'projectRef is required to target the project storage host.' };
    return tusOptions(
      supabaseAccessToken,
      `https://${projectRef}.supabase.co/storage/v1/upload/resumable/${wildcard}`,
    );
  },
});

export const supabaseHandleResumableUploadSignOptions = tool({
  description:
    'Handles CORS preflight OPTIONS request for TUS resumable upload signing. Use when preparing cross-origin resumable upload requests to verify allowed methods and headers. CORS preflight for resumable-upload signing; projectRef is required to target it.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    projectRef: z
      .string()
      .optional()
      .describe(
        'Project ref used to target the project host (e.g. https://<ref>.supabase.co). Required.',
      ),
  }),
  execute: async ({ supabaseAccessToken, projectRef }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    if (!projectRef) return { error: 'projectRef is required to target the project storage host.' };
    return tusOptions(
      supabaseAccessToken,
      `https://${projectRef}.supabase.co/storage/v1/upload/resumable/sign`,
    );
  },
});

export const supabaseHandleResumableUploadSignOptionsWithId = tool({
  description:
    'Handles CORS preflight OPTIONS request for TUS resumable upload signing endpoints. Use when preparing cross-origin resumable upload requests to verify allowed methods and headers. CORS preflight for one signing resource; projectRef is required to target it.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    wildcard: z
      .string()
      .describe(
        "The full path to the object for resumable upload signing, typically in format 'bucket-name/path/to/file'. This wildcard path segment is used for CORS preflight OPTIONS requests before the actual upload signing request.",
      ),
    projectRef: z
      .string()
      .optional()
      .describe(
        'Project ref used to target the project host (e.g. https://<ref>.supabase.co). Required.',
      ),
  }),
  execute: async ({ supabaseAccessToken, projectRef, wildcard }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    if (!projectRef) return { error: 'projectRef is required to target the project storage host.' };
    return tusOptions(
      supabaseAccessToken,
      `https://${projectRef}.supabase.co/storage/v1/upload/resumable/sign/${wildcard}`,
    );
  },
});

export const supabaseListBuckets = tool({
  description:
    'Retrieves a list of all storage buckets for a Supabase project, without returning bucket contents or access policies. Lists buckets only, without contents or policies.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique identifier of the Supabase project.'),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/storage/buckets`,
    );
  },
});
