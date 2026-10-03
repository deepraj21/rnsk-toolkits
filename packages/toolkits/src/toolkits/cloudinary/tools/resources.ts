// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cldDelete, cldGet, cldPost, cldUpload, parseCreds } from './client.js';

const credField = z
  .string()
  .optional()
  .describe(
    'Injected Cloudinary credentials JSON {cloudName, apiKey, apiSecret} — match manifest tokenField',
  );
const rtField = z.enum(['image', 'video', 'raw']).describe('Resource type');
const typeField = z
  .string()
  .optional()
  .describe('Delivery type, e.g. "upload" (default), "private", "authenticated"');

const detailFlags = {
  faces: z.boolean().optional().describe('Include detected face coordinates'),
  colors: z.boolean().optional().describe('Include color histogram and predominant colors'),
  phash: z.boolean().optional().describe('Include perceptual hash for similarity detection'),
  pages: z.boolean().optional().describe('Include page count for multi-page documents'),
  coordinates: z.boolean().optional().describe('Include custom crop and face coordinates'),
  imageMetadata: z.boolean().optional().describe('Include IPTC/XMP/Exif metadata (returns ETag)'),
  mediaMetadata: z
    .boolean()
    .optional()
    .describe('Include IPTC/XMP and detailed metadata (returns ETag)'),
  qualityAnalysis: z.boolean().optional().describe('Include image quality analysis scores'),
  accessibilityAnalysis: z.boolean().optional().describe('Include accessibility analysis scores'),
  versions: z.boolean().optional().describe('Include backed-up version details'),
  related: z.boolean().optional().describe('Include list of related assets'),
  maxResults: z
    .number()
    .int()
    .min(1)
    .max(500)
    .optional()
    .describe('Max derived/related assets to return (1-500)'),
  derivedNextCursor: z.string().optional().describe('Cursor for next page of derived assets'),
  relatedNextCursor: z.string().optional().describe('Cursor for next page of related assets'),
};

export const cloudinaryGetResourceByAssetId = tool({
  description: 'Get full details of an asset by its immutable asset ID, including derived assets.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    assetId: z.string().describe('Immutable asset ID (do not substitute a public ID)'),
    ...detailFlags,
  }),
  execute: ({ cloudinaryCredentials, assetId, ...flags }) => {
    const q: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(flags)) {
      q[k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)] = v;
    }
    return cldGet(parseCreds(cloudinaryCredentials), `/resources/${assetId}`, q);
  },
});

export const cloudinaryGetResourceByPublicId = tool({
  description:
    'Get details of a single asset by public ID. Resource type, delivery type and public ID must all match exactly.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    resourceType: rtField,
    type: z.string().describe('Delivery type, e.g. "upload", "private", "authenticated"'),
    publicId: z.string().describe('Public ID of the asset'),
    ...detailFlags,
  }),
  execute: ({ cloudinaryCredentials, resourceType, type, publicId, ...flags }) => {
    const q: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(flags)) {
      q[k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)] = v;
    }
    return cldGet(
      parseCreds(cloudinaryCredentials),
      `/resources/${resourceType}/${type}/${encodeURIComponent(publicId)}`,
      q,
    );
  },
});

const listOpts = {
  maxResults: z.number().int().min(1).max(500).optional().describe('Max assets to return (1-500)'),
  nextCursor: z.string().optional().describe('Pagination cursor from a previous response'),
  tags: z.boolean().optional().describe('Include tag list for each asset'),
  context: z.boolean().optional().describe('Include contextual metadata for each asset'),
  metadata: z.boolean().optional().describe('Include structured metadata for each asset'),
  moderations: z.boolean().optional().describe('Include moderation status for each asset'),
  fields: z.string().optional().describe('Comma-separated extra fields, e.g. "url,bytes,format"'),
  direction: z.string().optional().describe('Sort by creation: "asc" or "desc"'),
};

export const cloudinaryListImages = tool({
  description:
    'List image assets with optional filtering by prefix, tags, public IDs, or upload date.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    type: z
      .string()
      .optional()
      .describe('Storage type, e.g. "upload", "private" (required with prefix)'),
    prefix: z.string().optional().describe('Only assets whose public ID starts with this prefix'),
    publicIds: z.array(z.string()).optional().describe('Fetch specific images by public ID'),
    startAt: z.string().optional().describe('Only assets uploaded since ISO-8601 timestamp'),
    ...listOpts,
  }),
  execute: ({ cloudinaryCredentials, type, prefix, publicIds, startAt, ...opts }) =>
    cldGet(parseCreds(cloudinaryCredentials), `/resources/image${type ? `/${type}` : ''}`, {
      prefix,
      public_ids: publicIds,
      start_at: startAt,
      max_results: opts.maxResults,
      next_cursor: opts.nextCursor,
      tags: opts.tags,
      context: opts.context,
      metadata: opts.metadata,
      moderations: opts.moderations,
      fields: opts.fields,
      direction: opts.direction,
    }),
});

export const cloudinaryListVideos = tool({
  description:
    'List video (and audio) assets with optional filtering by prefix, public IDs, or upload date.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    type: z
      .string()
      .optional()
      .describe('Storage type, e.g. "upload", "private" (required with prefix)'),
    prefix: z.string().optional().describe('Only assets whose public ID starts with this prefix'),
    publicIds: z.array(z.string()).optional().describe('Fetch specific videos by public ID'),
    startAt: z.string().optional().describe('Only assets uploaded since ISO-8601 timestamp'),
    ...listOpts,
  }),
  execute: ({ cloudinaryCredentials, type, prefix, publicIds, startAt, ...opts }) =>
    cldGet(parseCreds(cloudinaryCredentials), `/resources/video${type ? `/${type}` : ''}`, {
      prefix,
      public_ids: publicIds,
      start_at: startAt,
      max_results: opts.maxResults,
      next_cursor: opts.nextCursor,
      tags: opts.tags,
      context: opts.context,
      metadata: opts.metadata,
      moderations: opts.moderations,
      fields: opts.fields,
      direction: opts.direction,
    }),
});

export const cloudinaryListRawFiles = tool({
  description:
    'List raw (non-media file) assets with optional filtering by prefix, public IDs, or upload date.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    type: z
      .string()
      .optional()
      .describe('Storage type, e.g. "upload", "private" (required with prefix)'),
    prefix: z.string().optional().describe('Only assets whose public ID starts with this prefix'),
    publicIds: z.array(z.string()).optional().describe('Fetch specific files by public ID'),
    startAt: z.string().optional().describe('Only assets uploaded since ISO-8601 timestamp'),
    ...listOpts,
  }),
  execute: ({ cloudinaryCredentials, type, prefix, publicIds, startAt, ...opts }) =>
    cldGet(parseCreds(cloudinaryCredentials), `/resources/raw${type ? `/${type}` : ''}`, {
      prefix,
      public_ids: publicIds,
      start_at: startAt,
      max_results: opts.maxResults,
      next_cursor: opts.nextCursor,
      tags: opts.tags,
      context: opts.context,
      metadata: opts.metadata,
      moderations: opts.moderations,
      fields: opts.fields,
      direction: opts.direction,
    }),
});

export const cloudinaryListResourcesByAssetIds = tool({
  description: 'Fetch up to 100 assets by their immutable asset IDs in one call.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    assetIds: z.array(z.string()).min(1).max(100).describe('Asset IDs to retrieve'),
    fields: z
      .array(z.string())
      .optional()
      .describe('Extra fields to include; public_id and asset_id always included'),
    resourceType: rtField.optional().describe('Filter by resource type'),
    ...listOpts,
  }),
  execute: ({ cloudinaryCredentials, assetIds, fields, resourceType, ...opts }) =>
    cldGet(parseCreds(cloudinaryCredentials), '/resources/by_asset_ids', {
      asset_ids: assetIds,
      fields: fields?.join(','),
      resource_type: resourceType,
      max_results: opts.maxResults,
      next_cursor: opts.nextCursor,
      tags: opts.tags,
      context: opts.context,
      metadata: opts.metadata,
      moderations: opts.moderations,
      direction: opts.direction,
    }),
});

export const cloudinaryListResourcesByExternalIds = tool({
  description: 'Fetch assets by the external IDs assigned to them at upload.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    externalIds: z.array(z.string()).min(1).describe('External IDs to retrieve'),
    fields: z
      .string()
      .optional()
      .describe('Comma-separated extra fields; public_id and asset_id always included'),
    resourceType: rtField.optional().describe('Filter by resource type'),
    ...listOpts,
  }),
  execute: ({ cloudinaryCredentials, externalIds, fields, resourceType, ...opts }) =>
    cldGet(parseCreds(cloudinaryCredentials), '/resources/by_external_ids', {
      external_ids: externalIds,
      fields,
      resource_type: resourceType,
      max_results: opts.maxResults,
      next_cursor: opts.nextCursor,
      tags: opts.tags,
      context: opts.context,
      metadata: opts.metadata,
      moderations: opts.moderations,
      direction: opts.direction,
    }),
});

export const cloudinaryListResourcesByTag = tool({
  description: 'List assets carrying a specific tag.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    tag: z.string().describe('Tag value to filter by'),
    resourceType: rtField.optional().describe('Resource type (default image)'),
    ...listOpts,
  }),
  execute: ({ cloudinaryCredentials, tag, resourceType, ...opts }) =>
    cldGet(
      parseCreds(cloudinaryCredentials),
      `/resources/${resourceType ?? 'image'}/tags/${encodeURIComponent(tag)}`,
      {
        max_results: opts.maxResults,
        next_cursor: opts.nextCursor,
        tags: opts.tags,
        context: opts.context,
        metadata: opts.metadata,
        moderations: opts.moderations,
        fields: opts.fields,
        direction: opts.direction,
      },
    ),
});

export const cloudinaryListResourcesByType = tool({
  description: 'List all assets of a resource type and delivery type (e.g. all uploaded images).',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    resourceType: rtField.optional().describe('Resource type (default image)'),
    type: z.string().optional().describe('Delivery type (default upload)'),
    ...listOpts,
  }),
  execute: ({ cloudinaryCredentials, resourceType, type, ...opts }) =>
    cldGet(
      parseCreds(cloudinaryCredentials),
      `/resources/${resourceType ?? 'image'}/${type ?? 'upload'}`,
      {
        max_results: opts.maxResults,
        next_cursor: opts.nextCursor,
        tags: opts.tags,
        context: opts.context,
        metadata: opts.metadata,
        moderations: opts.moderations,
        fields: opts.fields,
        direction: opts.direction,
      },
    ),
});

export const cloudinaryListResourceTypes = tool({
  description: 'List the resource types (image, video, raw) available in the product environment.',
  inputSchema: z.object({ cloudinaryCredentials: credField }),
  execute: ({ cloudinaryCredentials }) =>
    cldGet(parseCreds(cloudinaryCredentials), '/resource_types'),
});

export const cloudinaryGetResourcesByAssetFolder = tool({
  description: 'List assets stored directly in an asset folder (no subfolder contents).',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    assetFolder: z.string().describe('Asset folder path, e.g. "images/events"'),
    maxResults: z
      .number()
      .int()
      .min(1)
      .max(500)
      .optional()
      .describe('Max assets to return (default 50)'),
    nextCursor: z.string().optional().describe('Pagination cursor'),
  }),
  execute: ({ cloudinaryCredentials, assetFolder, maxResults, nextCursor }) =>
    cldGet(parseCreds(cloudinaryCredentials), '/resources/by_asset_folder', {
      asset_folder: assetFolder,
      max_results: maxResults,
      next_cursor: nextCursor,
    }),
});

export const cloudinaryGetResourcesByContext = tool({
  description: 'Find assets by a contextual metadata key, optionally with a value.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    key: z.string().describe('Context key to filter on, e.g. "alt"'),
    value: z.string().optional().describe('Context value; omit to match any asset having the key'),
    resourceType: rtField.optional().describe('Resource type (default image)'),
    ...listOpts,
  }),
  execute: ({ cloudinaryCredentials, key, value, resourceType, ...opts }) =>
    cldGet(parseCreds(cloudinaryCredentials), `/resources/${resourceType ?? 'image'}/context`, {
      key,
      value,
      max_results: opts.maxResults,
      next_cursor: opts.nextCursor,
      tags: opts.tags,
      context: opts.context,
      metadata: opts.metadata,
      moderations: opts.moderations,
      fields: opts.fields,
      direction: opts.direction,
    }),
});

export const cloudinaryGetResourcesInModeration = tool({
  description: 'List assets sitting in a moderation queue by kind and status.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    moderationKind: z.string().describe('Moderation queue, e.g. "manual","webpurify","aws_rek"'),
    status: z.string().describe('Status: pending, approved, rejected, queued, or aborted'),
    resourceType: rtField.optional().describe('Resource type (default image)'),
    ...listOpts,
  }),
  execute: ({ cloudinaryCredentials, moderationKind, status, resourceType, ...opts }) =>
    cldGet(
      parseCreds(cloudinaryCredentials),
      `/resources/${resourceType ?? 'image'}/moderations/${moderationKind}/${status}`,
      {
        max_results: opts.maxResults,
        next_cursor: opts.nextCursor,
        tags: opts.tags,
        context: opts.context,
        metadata: opts.metadata,
        moderations: opts.moderations,
        fields: opts.fields,
        direction: opts.direction,
      },
    ),
});

export const cloudinaryGetTags = tool({
  description:
    'List all tags used by a resource type, with optional prefix filtering and pagination.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    resourceType: rtField.optional().describe('Resource type (default image)'),
    prefix: z.string().optional().describe('Only tags starting with this prefix'),
    maxResults: z
      .number()
      .int()
      .min(1)
      .max(500)
      .optional()
      .describe('Max tags to return (default 10)'),
    nextCursor: z.string().optional().describe('Pagination cursor'),
  }),
  execute: ({ cloudinaryCredentials, resourceType, prefix, maxResults, nextCursor }) =>
    cldGet(parseCreds(cloudinaryCredentials), `/tags/${resourceType ?? 'image'}`, {
      prefix,
      max_results: maxResults,
      next_cursor: nextCursor,
    }),
});

const updateCommon = {
  tags: z.string().optional().describe('Comma-separated tags to assign (replaces existing)'),
  context: z
    .string()
    .optional()
    .describe('Context metadata pipe-separated, e.g. "alt=Photo|caption=Sunset"'),
  metadata: z
    .string()
    .optional()
    .describe('Structured metadata pipe-separated by external ID, e.g. "color_id=[\\"red\\"]"'),
  moderationStatus: z.string().optional().describe('Set moderation: "approved" or "rejected"'),
  assetFolder: z
    .string()
    .optional()
    .describe('Move asset to this asset folder (dynamic folder mode)'),
  displayName: z.string().optional().describe('User-friendly display name'),
  uniqueDisplayName: z.boolean().optional().describe('Enforce unique display name'),
  accessControl: z
    .array(z.record(z.any()))
    .optional()
    .describe('Access control rules, e.g. [{access_type:"token"}]'),
  autoTagging: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe('Auto-tagging confidence threshold 0-1'),
  categorization: z.string().optional().describe('Categorization add-on, e.g. "google_tagging"'),
  detection: z.string().optional().describe('Detection add-on, e.g. "adv_face"'),
  ocr: z.string().optional().describe('OCR add-on, e.g. "adv_ocr"'),
  backgroundRemoval: z.string().optional().describe('Background removal provider'),
  rawConvert: z.string().optional().describe('Raw conversion for raw files'),
  faceCoordinates: z.string().optional().describe('Face coordinates "x,y,w,h|x,y,w,h"'),
  customCoordinates: z.string().optional().describe('Custom crop coordinates "x,y,w,h"'),
  regions: z.string().optional().describe('Named region coordinate groups'),
  qualityOverride: z.string().optional().describe('Quality override value'),
  visualSearch: z.boolean().optional().describe('Index asset for visual search'),
  clearInvalid: z
    .boolean()
    .optional()
    .describe('Drop invalid metadata fields instead of keeping them'),
};

export const cloudinaryUpdateResourceByPublicId = tool({
  description:
    'Update tags, context, metadata, moderation, folder, or AI analysis on an asset by public ID.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    resourceType: rtField,
    type: z.string().describe('Delivery type, e.g. "upload"'),
    publicId: z.string().describe('Public ID of the asset to update'),
    ...updateCommon,
  }),
  execute: ({
    cloudinaryCredentials,
    resourceType,
    type,
    publicId,
    moderationStatus,
    assetFolder,
    displayName,
    uniqueDisplayName,
    accessControl,
    autoTagging,
    backgroundRemoval,
    rawConvert,
    faceCoordinates,
    customCoordinates,
    qualityOverride,
    visualSearch,
    clearInvalid,
    ...rest
  }) =>
    cldPost(
      parseCreds(cloudinaryCredentials),
      `/resources/${resourceType}/${type}/${encodeURIComponent(publicId)}`,
      {
        ...rest,
        moderation_status: moderationStatus,
        asset_folder: assetFolder,
        display_name: displayName,
        unique_display_name: uniqueDisplayName,
        access_control: accessControl ? JSON.stringify(accessControl) : undefined,
        auto_tagging: autoTagging,
        background_removal: backgroundRemoval,
        raw_convert: rawConvert,
        face_coordinates: faceCoordinates,
        custom_coordinates: customCoordinates,
        quality_override: qualityOverride,
        visual_search: visualSearch,
        clear_invalid: clearInvalid,
      },
    ),
});

export const cloudinaryUpdateResourceByAssetId = tool({
  description: 'Update an asset by its immutable asset ID (survives renames and moves).',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    assetId: z.string().describe('Immutable asset ID'),
    ...updateCommon,
  }),
  execute: ({
    cloudinaryCredentials,
    assetId,
    moderationStatus,
    assetFolder,
    displayName,
    uniqueDisplayName,
    accessControl,
    autoTagging,
    backgroundRemoval,
    rawConvert,
    faceCoordinates,
    customCoordinates,
    qualityOverride,
    visualSearch,
    clearInvalid,
    ...rest
  }) =>
    cldPost(parseCreds(cloudinaryCredentials), `/resources/${assetId}`, {
      ...rest,
      moderation_status: moderationStatus,
      asset_folder: assetFolder,
      display_name: displayName,
      unique_display_name: uniqueDisplayName,
      access_control: accessControl ? JSON.stringify(accessControl) : undefined,
      auto_tagging: autoTagging,
      background_removal: backgroundRemoval,
      raw_convert: rawConvert,
      face_coordinates: faceCoordinates,
      custom_coordinates: customCoordinates,
      quality_override: qualityOverride,
      visual_search: visualSearch,
      clear_invalid: clearInvalid,
    }),
});

export const cloudinaryUpdateResourceTags = tool({
  description:
    'Add, remove, replace, or clear tags on assets (max public_ids x tags of 1000 operations).',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    command: z.enum(['add', 'remove', 'remove_all', 'replace']).describe('Tag operation'),
    publicIds: z.array(z.string()).min(1).describe('Public IDs to update'),
    tag: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .describe('Tag or tags (not needed for remove_all)'),
    resourceType: rtField.optional().describe('Resource type (default image)'),
    type: typeField,
  }),
  execute: ({ cloudinaryCredentials, command, publicIds, tag, resourceType, type }) =>
    cldPost(
      parseCreds(cloudinaryCredentials),
      `/resources/${resourceType ?? 'image'}/tags/${command}`,
      {
        public_ids: publicIds,
        tag: Array.isArray(tag) ? tag.join(',') : tag,
        type,
      },
    ),
});

export const cloudinaryManageContext = tool({
  description: 'Add/update or remove all contextual metadata on assets.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    command: z
      .enum(['add', 'remove_all'])
      .describe('"add" sets context keys; "remove_all" clears all context'),
    publicIds: z.array(z.string()).min(1).describe('Public IDs to update'),
    context: z
      .record(z.string())
      .optional()
      .describe('Context key-values, e.g. {alt:"Photo"} (required for add)'),
    resourceType: rtField.optional().describe('Resource type (default image)'),
    type: typeField,
  }),
  execute: ({ cloudinaryCredentials, command, publicIds, context, resourceType, type }) =>
    cldPost(parseCreds(cloudinaryCredentials), `/resources/${resourceType ?? 'image'}/context`, {
      command,
      public_ids: publicIds,
      context,
      type,
    }),
});

export const cloudinaryUpdateAssetMetadata = tool({
  description: 'Set structured metadata field values on assets by external field ID.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    publicIds: z.array(z.string()).min(1).describe('Public IDs to update'),
    metadata: z
      .record(z.any())
      .describe('Field values keyed by external ID, e.g. {color_id:"red"}'),
    resourceType: rtField.optional().describe('Resource type (default image)'),
    type: typeField,
    clearInvalid: z.boolean().optional().describe('Drop invalid metadata keys before processing'),
  }),
  execute: ({ cloudinaryCredentials, publicIds, metadata, resourceType, type, clearInvalid }) =>
    cldPost(parseCreds(cloudinaryCredentials), `/resources/${resourceType ?? 'image'}/metadata`, {
      public_ids: publicIds,
      metadata,
      type,
      clear_invalid: clearInvalid,
    }),
});

export const cloudinaryRenameResource = tool({
  description:
    "Rename an asset's public ID (reorganize without re-uploading). URLs change; optionally invalidate CDN.",
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    resourceType: rtField,
    fromPublicId: z.string().describe('Current public ID'),
    toPublicId: z.string().describe('New public ID (may include folder path)'),
    type: z.string().optional().describe('Current delivery type (default upload)'),
    toType: z.string().optional().describe('New delivery type (default keeps current)'),
    overwrite: z.boolean().optional().describe('Overwrite the target if it already exists'),
    invalidate: z.boolean().optional().describe('Invalidate CDN cache of the old URL'),
  }),
  execute: ({
    cloudinaryCredentials,
    resourceType,
    fromPublicId,
    toPublicId,
    type,
    toType,
    overwrite,
    invalidate,
  }) =>
    cldUpload(parseCreds(cloudinaryCredentials), resourceType, 'rename', {
      from_public_id: fromPublicId,
      to_public_id: toPublicId,
      type,
      to_type: toType,
      overwrite,
      invalidate,
    }),
});

export const cloudinaryDestroyAsset = tool({
  description: 'Permanently destroy one asset by public ID. Irreversible unless backups exist.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    publicId: z.string().describe('Public ID of the asset to destroy'),
    resourceType: rtField.optional().describe('Resource type (default image)'),
    invalidate: z.boolean().optional().describe('Invalidate CDN cached copies'),
  }),
  execute: ({ cloudinaryCredentials, publicId, resourceType, invalidate }) =>
    cldUpload(parseCreds(cloudinaryCredentials), resourceType ?? 'image', 'destroy', {
      public_id: publicId,
      invalidate,
    }),
});

export const cloudinaryDestroyAssetById = tool({
  description: 'Permanently delete one asset by its immutable asset ID.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    assetId: z.string().describe('Immutable asset ID to delete'),
    invalidate: z.boolean().optional().describe('Invalidate CDN cached copies'),
    notificationUrl: z.string().optional().describe('Webhook notified when deletion completes'),
  }),
  execute: ({ cloudinaryCredentials, assetId, invalidate, notificationUrl }) =>
    cldDelete(parseCreds(cloudinaryCredentials), '/resources', {
      asset_ids: [assetId],
      invalidate,
      notification_url: notificationUrl,
    }),
});

export const cloudinaryDeleteResourcesByPublicId = tool({
  description: 'Bulk delete assets by public IDs, by prefix, or all of a type. Irreversible.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    publicIds: z
      .array(z.string())
      .optional()
      .describe('Public IDs to delete (max 100; exclusive with prefix/all)'),
    prefix: z
      .string()
      .optional()
      .describe('Delete assets whose public ID starts with this (exclusive)'),
    all: z.boolean().optional().describe('Delete all assets of the type (exclusive, up to 1000)'),
    nextCursor: z.string().optional().describe('Continue a partial prefix/all deletion'),
    resourceType: rtField.optional().describe('Resource type (default image)'),
    type: z.string().optional().describe('Delivery type (default upload)'),
    invalidate: z.boolean().optional().describe('Invalidate CDN cached copies'),
    keepOriginal: z.boolean().optional().describe('Delete only derived assets, keep originals'),
    transformations: z
      .string()
      .optional()
      .describe('Only delete derived assets matching these transformations (| separated)'),
  }),
  execute: ({
    cloudinaryCredentials,
    publicIds,
    prefix,
    all,
    nextCursor,
    resourceType,
    type,
    invalidate,
    keepOriginal,
    transformations,
  }) => {
    if ([publicIds, prefix, all].filter((v) => v !== undefined && v !== false).length !== 1) {
      return { error: 'Provide exactly one of publicIds, prefix, or all.' };
    }
    return cldDelete(
      parseCreds(cloudinaryCredentials),
      `/resources/${resourceType ?? 'image'}/${type ?? 'upload'}`,
      {
        public_ids: publicIds,
        prefix,
        all,
        next_cursor: nextCursor,
        invalidate,
        keep_original: keepOriginal,
        transformations,
      },
    );
  },
});

export const cloudinaryDeleteResourcesByAssetId = tool({
  description: 'Bulk delete up to 100 assets by immutable asset IDs.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    assetIds: z.array(z.string()).min(1).max(100).describe('Asset IDs to delete'),
    invalidate: z.boolean().optional().describe('Invalidate CDN cached copies'),
    keepOriginal: z.boolean().optional().describe('Delete only derived assets, keep originals'),
    transformations: z
      .array(z.string())
      .optional()
      .describe('Only delete derived assets matching these transformations'),
  }),
  execute: ({ cloudinaryCredentials, assetIds, invalidate, keepOriginal, transformations }) =>
    cldDelete(parseCreds(cloudinaryCredentials), '/resources', {
      asset_ids: assetIds,
      invalidate,
      keep_original: keepOriginal,
      transformations,
    }),
});

export const cloudinaryDeleteResourcesByTags = tool({
  description: 'Delete all assets carrying a tag. Irreversible.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    tag: z.string().describe('Tag whose assets should be deleted'),
    resourceType: rtField.optional().describe('Resource type (default image)'),
    invalidate: z.boolean().optional().describe('Invalidate CDN cached copies'),
    keepOriginal: z.boolean().optional().describe('Delete only derived assets, keep originals'),
    nextCursor: z.string().optional().describe('Continue a partial (1000+) deletion'),
    transformations: z
      .string()
      .optional()
      .describe('Only delete derived assets matching these transformations'),
  }),
  execute: ({
    cloudinaryCredentials,
    tag,
    resourceType,
    invalidate,
    keepOriginal,
    nextCursor,
    transformations,
  }) =>
    cldDelete(
      parseCreds(cloudinaryCredentials),
      `/resources/${resourceType ?? 'image'}/tags/${encodeURIComponent(tag)}`,
      {
        invalidate,
        keep_original: keepOriginal,
        next_cursor: nextCursor,
        transformations,
      },
    ),
});

export const cloudinaryDeleteDerivedResources = tool({
  description: 'Delete up to 100 derived (transformed) assets by their derived resource IDs.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    derivedResourceIds: z
      .array(z.string())
      .min(1)
      .max(100)
      .describe('Derived resource IDs to delete'),
  }),
  execute: ({ cloudinaryCredentials, derivedResourceIds }) =>
    cldDelete(parseCreds(cloudinaryCredentials), '/derived_resources', {
      derived_resource_ids: derivedResourceIds,
    }),
});

export const cloudinaryRestoreResources = tool({
  description:
    'Restore deleted assets (backups must exist) by public ID, optionally specific versions.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    publicIds: z.array(z.string()).min(1).describe('Public IDs to restore'),
    versions: z.array(z.string()).optional().describe('Specific version IDs to restore'),
    resourceType: rtField.optional().describe('Resource type (default image)'),
    type: z.string().optional().describe('Delivery type (default upload)'),
  }),
  execute: ({ cloudinaryCredentials, publicIds, versions, resourceType, type }) =>
    cldPost(
      parseCreds(cloudinaryCredentials),
      `/resources/${resourceType ?? 'image'}/${type ?? 'upload'}/restore`,
      {
        public_ids: publicIds,
        versions,
      },
    ),
});

export const cloudinaryRestoreResourcesByAssetIds = tool({
  description: 'Restore backed-up assets by immutable asset IDs, optionally specific versions.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    assetIds: z.array(z.string()).min(1).describe('Asset IDs to restore'),
    versions: z
      .array(z.string())
      .optional()
      .describe('Version IDs to restore (must match assetIds count if given)'),
    notificationUrl: z.string().optional().describe('Webhook notified when restore completes'),
  }),
  execute: ({ cloudinaryCredentials, assetIds, versions, notificationUrl }) =>
    cldPost(parseCreds(cloudinaryCredentials), '/resources/restore', {
      asset_ids: assetIds,
      versions,
      notification_url: notificationUrl,
    }),
});

export const cloudinaryPublishResources = tool({
  description: 'Make private/authenticated assets publicly accessible, by IDs, prefix, or tag.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    publicIds: z
      .array(z.string())
      .optional()
      .describe('Public IDs to publish (exclusive with prefix/tag)'),
    prefix: z.string().optional().describe('Publish assets with this public ID prefix (exclusive)'),
    tag: z.string().optional().describe('Publish all assets with this tag (exclusive)'),
    resourceType: rtField.optional().describe('Resource type (default image)'),
    type: z.string().optional().describe('Current delivery type of the assets'),
    overwrite: z
      .boolean()
      .optional()
      .describe('Overwrite existing published assets with the same public ID'),
    invalidate: z.boolean().optional().describe('Invalidate CDN cached copies'),
  }),
  execute: ({
    cloudinaryCredentials,
    publicIds,
    prefix,
    tag,
    resourceType,
    type,
    overwrite,
    invalidate,
  }) => {
    if ([publicIds, prefix, tag].filter((v) => v !== undefined).length !== 1) {
      return { error: 'Provide exactly one of publicIds, prefix, or tag.' };
    }
    return cldPost(
      parseCreds(cloudinaryCredentials),
      `/resources/${resourceType ?? 'image'}/publish_resources`,
      {
        public_ids: publicIds,
        prefix,
        tag,
        type,
        overwrite,
        invalidate,
      },
    );
  },
});

export const cloudinaryExplicitResource = tool({
  description:
    'Update an uploaded asset and/or eagerly generate derived transformations (not rate-limited).',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    publicId: z.string().describe('Public ID of the existing asset'),
    resourceType: rtField.optional().describe('Resource type (default image)'),
    type: z.string().optional().describe('Delivery type (default upload)'),
    eager: z
      .array(z.string())
      .optional()
      .describe('Eager transformations to pre-generate, e.g. ["c_fill,w_300,h_200"]'),
    eagerAsync: z.boolean().optional().describe('Generate eager transformations in the background'),
    tags: z.array(z.string()).optional().describe('Tags (replaces existing)'),
    context: z.record(z.string()).optional().describe('Context metadata, e.g. {alt:"Photo"}'),
    metadata: z.record(z.any()).optional().describe('Structured metadata by external field ID'),
    moderation: z.string().optional().describe('Moderation kind, e.g. "manual"'),
    faces: z.boolean().optional().describe('Detect faces and return coordinates'),
    colors: z.boolean().optional().describe('Extract predominant colors'),
    qualityAnalysis: z.boolean().optional().describe('Run image quality analysis'),
    accessibilityAnalysis: z.boolean().optional().describe('Run accessibility analysis'),
    overwrite: z.boolean().optional().describe('Overwrite existing derived resources'),
    invalidate: z.boolean().optional().describe('Invalidate CDN cache'),
    assetFolder: z.string().optional().describe('Move asset to this folder (dynamic folder mode)'),
    displayName: z.string().optional().describe('New display name'),
    notificationUrl: z.string().optional().describe('Webhook for async eager completion'),
  }),
  execute: ({
    cloudinaryCredentials,
    publicId,
    resourceType,
    type,
    eager,
    eagerAsync,
    qualityAnalysis,
    accessibilityAnalysis,
    assetFolder,
    displayName,
    notificationUrl,
    ...rest
  }) =>
    cldUpload(parseCreds(cloudinaryCredentials), resourceType ?? 'image', 'explicit', {
      public_id: publicId,
      type,
      eager: eager?.join('|'),
      eager_async: eagerAsync,
      quality_analysis: qualityAnalysis,
      accessibility_analysis: accessibilityAnalysis,
      asset_folder: assetFolder,
      display_name: displayName,
      notification_url: notificationUrl,
      ...rest,
    }),
});

export const cloudinaryCreateAssetRelationsByPublicId = tool({
  description:
    'Relate up to 10 assets to a primary asset by public ID (e.g. subtitles to video). Bidirectional.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    resourceType: rtField,
    type: z.string().describe('Delivery type of the primary asset, e.g. "upload"'),
    publicId: z.string().describe('Public ID of the primary asset'),
    assetsToRelate: z
      .array(z.string())
      .min(1)
      .max(10)
      .describe('Assets as resource_type/type/public_id, e.g. ["raw/upload/subs.srt"]'),
  }),
  execute: ({ cloudinaryCredentials, resourceType, type, publicId, assetsToRelate }) =>
    cldPost(
      parseCreds(cloudinaryCredentials),
      `/resources/related_assets/${resourceType}/${type}/${encodeURIComponent(publicId)}`,
      { assets_to_relate: assetsToRelate },
    ),
});

export const cloudinaryCreateAssetRelationsByAssetId = tool({
  description: 'Relate up to 10 assets to a primary asset by immutable asset IDs. Bidirectional.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    assetId: z.string().describe('Asset ID of the primary asset'),
    assetsToRelate: z.array(z.string()).min(1).max(10).describe('Asset IDs to relate'),
  }),
  execute: ({ cloudinaryCredentials, assetId, assetsToRelate }) =>
    cldPost(parseCreds(cloudinaryCredentials), `/resources/related_assets/${assetId}`, {
      assets_to_relate: assetsToRelate,
    }),
});

export const cloudinaryDeleteAssetRelationsByPublicId = tool({
  description: 'Unrelate assets from a primary asset by public ID. Bidirectional.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    resourceType: rtField,
    type: z.string().describe('Delivery type of the primary asset'),
    publicId: z.string().describe('Public ID of the primary asset'),
    assetsToUnrelate: z
      .array(z.string())
      .min(1)
      .describe('Assets as resource_type/type/public_id to unrelate'),
  }),
  execute: ({ cloudinaryCredentials, resourceType, type, publicId, assetsToUnrelate }) =>
    cldDelete(
      parseCreds(cloudinaryCredentials),
      `/resources/related_assets/${resourceType}/${type}/${encodeURIComponent(publicId)}`,
      { assets_to_unrelate: assetsToUnrelate },
    ),
});

export const cloudinaryDeleteAssetRelationsByAssetId = tool({
  description: 'Unrelate assets from a primary asset by immutable asset IDs. Bidirectional.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    assetId: z.string().describe('Asset ID of the primary asset'),
    assetsToUnrelate: z.array(z.string()).min(1).describe('Asset IDs to unrelate'),
  }),
  execute: ({ cloudinaryCredentials, assetId, assetsToUnrelate }) =>
    cldDelete(parseCreds(cloudinaryCredentials), `/resources/related_assets/${assetId}`, {
      assets_to_unrelate: assetsToUnrelate,
    }),
});
