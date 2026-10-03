// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
  cldAnalysisGet,
  cldDelete,
  cldGet,
  cldJson,
  cldVideoAnalytics,
  parseCreds,
} from './client.js';

const credField = z
  .string()
  .optional()
  .describe(
    'Injected Cloudinary credentials JSON {cloudName, apiKey, apiSecret} — match manifest tokenField',
  );

export const cloudinaryPing = tool({
  description: 'Ping Cloudinary to verify credentials and API reachability.',
  inputSchema: z.object({ cloudinaryCredentials: credField }),
  execute: ({ cloudinaryCredentials }) => cldGet(parseCreds(cloudinaryCredentials), '/ping'),
});

export const cloudinaryGetUsage = tool({
  description:
    'Get storage, bandwidth, request, and transformation usage vs plan limits. Check when uploads fail unexpectedly.',
  inputSchema: z.object({ cloudinaryCredentials: credField }),
  execute: ({ cloudinaryCredentials }) => cldGet(parseCreds(cloudinaryCredentials), '/usage'),
});

export const cloudinaryGetConfig = tool({
  description:
    'Get product environment config (cloud name, created date, folder_mode). Folder mode constrains folder/preset operations.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    settings: z.boolean().optional().describe('Include current settings such as folder_mode'),
  }),
  execute: ({ cloudinaryCredentials, settings }) =>
    cldGet(parseCreds(cloudinaryCredentials), '/config', { settings }),
});

export const cloudinaryGetTriggers = tool({
  description: 'List webhook triggers, optionally filtered by event type.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    eventType: z.string().optional().describe('Filter by event, e.g. "upload","delete"'),
  }),
  execute: ({ cloudinaryCredentials, eventType }) =>
    cldGet(parseCreds(cloudinaryCredentials), '/triggers', { event_type: eventType }),
});

export const cloudinaryCreateTrigger = tool({
  description: 'Create a webhook trigger that notifies a URL on an event type (or "all").',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    uri: z.string().describe('HTTPS notification URL, e.g. "https://example.com/hooks/cloudinary"'),
    eventType: z.string().describe('Event type, e.g. "upload","delete","all"'),
  }),
  execute: ({ cloudinaryCredentials, uri, eventType }) =>
    cldJson(parseCreds(cloudinaryCredentials), 'POST', '/triggers', {
      uri,
      event_type: eventType,
    }),
});

export const cloudinaryUpdateTrigger = tool({
  description: 'Change the notification URL of an existing webhook trigger.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    triggerId: z.string().describe('Trigger ID to update'),
    newUri: z.string().describe('Replacement HTTPS notification URL'),
  }),
  execute: ({ cloudinaryCredentials, triggerId, newUri }) =>
    cldJson(
      parseCreds(cloudinaryCredentials),
      'PUT',
      `/triggers/${encodeURIComponent(triggerId)}`,
      {
        new_uri: newUri,
      },
    ),
});

export const cloudinaryDeleteTrigger = tool({
  description: 'Delete a webhook trigger by ID.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    triggerId: z.string().describe('Trigger ID to delete'),
  }),
  execute: ({ cloudinaryCredentials, triggerId }) =>
    cldDelete(parseCreds(cloudinaryCredentials), `/triggers/${encodeURIComponent(triggerId)}`),
});

export const cloudinaryListUploadPresets = tool({
  description: 'List upload presets with sorting and pagination.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    orderBy: z.enum(['name', 'id', 'updated_at']).optional().describe('Sort field'),
    direction: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    nextCursor: z.string().optional().describe('Pagination cursor'),
  }),
  execute: ({ cloudinaryCredentials, orderBy, direction, nextCursor }) =>
    cldGet(parseCreds(cloudinaryCredentials), '/upload_presets', {
      order_by: orderBy,
      direction,
      next_cursor: nextCursor,
    }),
});

export const cloudinaryGetUploadPreset = tool({
  description: 'Get one upload preset configuration by name.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    name: z.string().describe('Preset name, e.g. "my_preset"'),
  }),
  execute: ({ cloudinaryCredentials, name }) =>
    cldGet(parseCreds(cloudinaryCredentials), `/upload_presets/${encodeURIComponent(name)}`),
});

const presetFields = {
  tags: z.string().optional().describe('Comma-separated tags applied to uploads'),
  folder: z.string().optional().describe('Destination folder path'),
  transformation: z.string().optional().describe('Incoming transformation, e.g. "c_limit,w_500"'),
  eager: z.string().optional().describe('Eager transformations generated on upload'),
  unsigned: z.boolean().optional().describe('Allow unsigned uploads with this preset'),
  overwrite: z.boolean().optional().describe('Overwrite existing assets with the same public ID'),
  useFilename: z.boolean().optional().describe('Use the original filename'),
  uniqueFilename: z.boolean().optional().describe('Append random suffix to filenames'),
  allowedFormats: z.string().optional().describe('Allowed formats, e.g. "jpg,png"'),
  moderation: z.string().optional().describe('Moderation type, e.g. "manual","aws_rek"'),
  notificationUrl: z.string().optional().describe('Webhook URL for upload notifications'),
  callback: z.string().optional().describe('Callback URL for upload responses'),
  context: z.string().optional().describe('Context metadata key=value|key2=value2'),
  autoTagging: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe('Auto-tagging confidence threshold 0-1'),
  categorization: z.string().optional().describe('Categorization add-on(s)'),
  detection: z.string().optional().describe('Detection add-on, e.g. "adv_face"'),
  ocr: z.string().optional().describe('OCR add-on, e.g. "adv_ocr"'),
  backgroundRemoval: z.string().optional().describe('Background removal add-on'),
  qualityAnalysis: z.boolean().optional().describe('Run quality analysis'),
  accessibilityAnalysis: z.boolean().optional().describe('Run accessibility analysis'),
  cinemagraphAnalysis: z.boolean().optional().describe('Run cinemagraph analysis'),
  resourceType: z
    .enum(['image', 'video', 'raw'])
    .optional()
    .describe('Asset type the preset applies to'),
};

function presetBody(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const map: Record<string, string> = {
    useFilename: 'use_filename',
    uniqueFilename: 'unique_filename',
    allowedFormats: 'allowed_formats',
    notificationUrl: 'notification_url',
    autoTagging: 'auto_tagging',
    backgroundRemoval: 'background_removal',
    qualityAnalysis: 'quality_analysis',
    accessibilityAnalysis: 'accessibility_analysis',
    cinemagraphAnalysis: 'cinemagraph_analysis',
  };
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined) continue;
    if (k === 'resourceType') out.resource_type = v;
    else out[map[k] ?? k] = v;
  }
  return out;
}

export const cloudinaryCreateUploadPreset = tool({
  description:
    'Create an upload preset centralizing tags, formats, transformations, and analysis defaults.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    name: z.string().optional().describe('Preset name (auto-generated if omitted)'),
    ...presetFields,
  }),
  execute: ({ cloudinaryCredentials, name, ...rest }) =>
    cldJson(parseCreds(cloudinaryCredentials), 'POST', '/upload_presets', {
      name,
      ...presetBody(rest),
    }),
});

export const cloudinaryUpdateUploadPreset = tool({
  description: 'Update an upload preset tags, transformations, or analysis settings.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    name: z.string().describe('Preset name to update'),
    ...presetFields,
  }),
  execute: ({ cloudinaryCredentials, name, ...rest }) =>
    cldJson(
      parseCreds(cloudinaryCredentials),
      'PUT',
      `/upload_presets/${encodeURIComponent(name)}`,
      presetBody(rest),
    ),
});

export const cloudinaryDeleteUploadPreset = tool({
  description: 'Delete an upload preset that is no longer needed.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    name: z.string().describe('Preset name to delete'),
  }),
  execute: ({ cloudinaryCredentials, name }) =>
    cldDelete(parseCreds(cloudinaryCredentials), `/upload_presets/${encodeURIComponent(name)}`),
});

export const cloudinaryGetUploadMappings = tool({
  description: 'List URL-prefix to folder upload mappings with pagination.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    maxResults: z.number().int().min(1).max(500).optional().describe('Max mappings to return'),
    nextCursor: z.string().optional().describe('Pagination cursor'),
  }),
  execute: ({ cloudinaryCredentials, maxResults, nextCursor }) =>
    cldGet(parseCreds(cloudinaryCredentials), '/upload_mappings', {
      max_results: maxResults,
      next_cursor: nextCursor,
    }),
});

export const cloudinaryGetUploadMappingDetails = tool({
  description: 'Get the URL template mapped to one folder.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    folder: z.string().describe('Mapping folder name, e.g. "wiki"'),
  }),
  execute: ({ cloudinaryCredentials, folder }) =>
    cldGet(parseCreds(cloudinaryCredentials), `/upload_mappings/${encodeURIComponent(folder)}`),
});

export const cloudinaryCreateUploadMapping = tool({
  description: 'Map an external URL prefix to a Cloudinary folder for dynamic fetching.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    folder: z.string().describe('Folder to map, e.g. "wiki"'),
    template: z.string().describe('URL prefix, e.g. "https://www.example.com/images/"'),
  }),
  execute: ({ cloudinaryCredentials, folder, template }) =>
    cldJson(parseCreds(cloudinaryCredentials), 'POST', '/upload_mappings', { folder, template }),
});

export const cloudinaryUpdateUploadMapping = tool({
  description: 'Change the URL template of an existing folder mapping (must be http(s)).',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    folder: z.string().describe('Mapping folder name to update'),
    template: z.string().describe('New URL template'),
  }),
  execute: ({ cloudinaryCredentials, folder, template }) =>
    cldJson(
      parseCreds(cloudinaryCredentials),
      'PUT',
      `/upload_mappings/${encodeURIComponent(folder)}`,
      { template },
    ),
});

export const cloudinaryDeleteUploadMapping = tool({
  description: 'Delete a folder upload mapping.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    folder: z.string().describe('Mapping folder name to delete'),
  }),
  execute: ({ cloudinaryCredentials, folder }) =>
    cldDelete(parseCreds(cloudinaryCredentials), `/upload_mappings/${encodeURIComponent(folder)}`),
});

export const cloudinaryGetVideoViews = tool({
  description: 'Get video player analytics views with watch time, location, and device data.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    expression: z.string().optional().describe('Filter, e.g. "video_public_id=skate"'),
    sortBy: z.string().optional().describe('Sort, e.g. "view_ended_at" or "-view_watch_time"'),
    maxResults: z.number().int().optional().describe('Max views to return (default 10)'),
    nextCursor: z.string().optional().describe('Pagination cursor'),
  }),
  execute: ({ cloudinaryCredentials, expression, sortBy, maxResults, nextCursor }) =>
    cldVideoAnalytics(parseCreds(cloudinaryCredentials), {
      expression,
      sort_by: sortBy,
      max_results: maxResults,
      next_cursor: nextCursor,
    }),
});

export const cloudinaryGetAnalysisTaskStatus = tool({
  description: 'Poll an async AI analysis task (Analyze API) until it completes or fails.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    taskId: z.string().describe('Task ID returned when the analysis was submitted'),
  }),
  execute: ({ cloudinaryCredentials, taskId }) =>
    cldAnalysisGet(parseCreds(cloudinaryCredentials), `/tasks/${encodeURIComponent(taskId)}`),
});
