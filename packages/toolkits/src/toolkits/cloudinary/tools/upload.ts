// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cldUpload, parseCreds } from './client.js';

const credField = z
  .string()
  .optional()
  .describe(
    'Injected Cloudinary credentials JSON {cloudName, apiKey, apiSecret} — match manifest tokenField',
  );

const uploadOpts = {
  publicId: z.string().optional().describe('Public ID to assign (auto-generated if omitted)'),
  folder: z.string().optional().describe('Folder path for the asset, e.g. "images/events/2023"'),
  tags: z.string().optional().describe('Comma-separated tags, e.g. "summer,sale"'),
  transformation: z.string().optional().describe('Incoming transformation, e.g. "c_limit,w_500"'),
  eager: z
    .string()
    .optional()
    .describe('Eager transformations, pipe-separated for multi ("w_300|w_100")'),
  format: z.string().optional().describe('Convert to this format on upload, e.g. "webp"'),
  overwrite: z.boolean().optional().describe('Overwrite an existing asset with the same public ID'),
  uniqueFilename: z
    .boolean()
    .optional()
    .describe('Append random suffix to avoid collisions (default true)'),
  useFilename: z.boolean().optional().describe('Use the original filename as public ID'),
  context: z
    .string()
    .optional()
    .describe('Context metadata pipe-separated, e.g. "alt=Photo|caption=Sunset"'),
  metadata: z.string().optional().describe('Structured metadata pipe-separated by external ID'),
  moderation: z.string().optional().describe('Moderation kind, e.g. "manual","aws_rek"'),
  autoTagging: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe('AI auto-tagging confidence threshold 0-1'),
  faces: z.boolean().optional().describe('Detect faces and return coordinates'),
  colors: z.boolean().optional().describe('Extract predominant colors'),
  phash: z.boolean().optional().describe('Calculate perceptual hash'),
  qualityAnalysis: z.boolean().optional().describe('Run image quality analysis'),
  accessibilityAnalysis: z.boolean().optional().describe('Run accessibility analysis'),
  backgroundRemoval: z.string().optional().describe('Background removal, e.g. "cloudinary_ai"'),
  uploadPreset: z.string().optional().describe('Upload preset whose defaults apply'),
  notificationUrl: z.string().optional().describe('Webhook notified when upload completes'),
  async: z.boolean().optional().describe('Process the upload asynchronously'),
};

export const cloudinaryUploadAsset = tool({
  description: 'Upload an image, video, or raw file from a remote URL or base64 content.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    fileUrl: z
      .string()
      .optional()
      .describe('Remote file URL for Cloudinary to fetch (or a data URI)'),
    fileName: z.string().optional().describe('File name (required with fileContentBase64)'),
    fileContentBase64: z
      .string()
      .optional()
      .describe('Base64 file content (or data URI); alternative to fileUrl'),
    contentType: z.string().optional().describe('MIME type for binary uploads'),
    resourceType: z
      .enum(['image', 'video', 'raw', 'auto'])
      .optional()
      .describe('Resource type (default auto-detect)'),
    type: z.string().optional().describe('Delivery type: upload, private, authenticated'),
    ...uploadOpts,
  }),
  execute: ({
    cloudinaryCredentials,
    fileUrl,
    fileName,
    fileContentBase64,
    contentType,
    resourceType,
    type,
    autoTagging,
    qualityAnalysis,
    accessibilityAnalysis,
    backgroundRemoval,
    uniqueFilename,
    useFilename,
    uploadPreset,
    notificationUrl,
    ...rest
  }) => {
    const file =
      fileUrl ?? (fileContentBase64 ? { fileName, fileContentBase64, contentType } : undefined);
    if (!file) return { error: 'Provide fileUrl or fileContentBase64 (+fileName).' };
    return cldUpload(
      parseCreds(cloudinaryCredentials),
      resourceType ?? 'auto',
      'upload',
      {
        type,
        auto_tagging: autoTagging,
        quality_analysis: qualityAnalysis,
        accessibility_analysis: accessibilityAnalysis,
        background_removal: backgroundRemoval,
        unique_filename: uniqueFilename,
        use_filename: useFilename,
        upload_preset: uploadPreset,
        notification_url: notificationUrl,
        async: rest.async,
        ...rest,
      },
      file,
    );
  },
});

export const cloudinaryUploadFileAutoDetect = tool({
  description: 'Upload any file with automatic type detection plus the full upload option set.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    file: z.string().describe('File to upload: remote URL, data URI, or base64 content'),
    fileName: z.string().optional().describe('File name used when uploading base64 content'),
    contentType: z.string().optional().describe('MIME type for binary uploads'),
    type: z.string().optional().describe('Delivery type: upload, private, authenticated'),
    allowedFormats: z
      .string()
      .optional()
      .describe('Fail unless the file format is in this comma list'),
    categorization: z.string().optional().describe('Categorization add-on, e.g. "google_tagging"'),
    detection: z.string().optional().describe('Detection add-on, e.g. "adv_face"'),
    ocr: z.string().optional().describe('OCR add-on, e.g. "adv_ocr"'),
    eval: z.string().optional().describe('Conditional transformation logic to execute'),
    proxy: z.string().optional().describe('Proxy URL when uploading from a remote URL'),
    backup: z.boolean().optional().describe('Keep a backup copy of the asset'),
    headers: z
      .string()
      .optional()
      .describe('Custom headers for remote-URL fetch (newline-separated)'),
    assetFolder: z.string().optional().describe('Dynamic asset folder path (overrides folder)'),
    displayName: z.string().optional().describe('Display name for the asset'),
    accessControl: z
      .string()
      .optional()
      .describe('Access control rules as JSON, e.g. \'[{"access_type":"token"}]\''),
    mediaMetadata: z.boolean().optional().describe('Extract embedded EXIF/IPTC/XMP metadata'),
    visualSearch: z.boolean().optional().describe('Index asset for visual search'),
    ...uploadOpts,
  }),
  execute: ({
    cloudinaryCredentials,
    file,
    fileName,
    contentType,
    type,
    allowedFormats,
    assetFolder,
    displayName,
    accessControl,
    mediaMetadata,
    visualSearch,
    autoTagging,
    qualityAnalysis,
    accessibilityAnalysis,
    backgroundRemoval,
    uniqueFilename,
    useFilename,
    uploadPreset,
    notificationUrl,
    ...rest
  }) => {
    const isUrl = /^https?:\/\//i.test(file) || file.startsWith('data:');
    const payload = isUrl ? file : { fileName, fileContentBase64: file, contentType };
    return cldUpload(
      parseCreds(cloudinaryCredentials),
      'auto',
      'upload',
      {
        type,
        allowed_formats: allowedFormats,
        asset_folder: assetFolder,
        display_name: displayName,
        access_control: accessControl,
        media_metadata: mediaMetadata,
        visual_search: visualSearch,
        auto_tagging: autoTagging,
        quality_analysis: qualityAnalysis,
        accessibility_analysis: accessibilityAnalysis,
        background_removal: backgroundRemoval,
        unique_filename: uniqueFilename,
        use_filename: useFilename,
        upload_preset: uploadPreset,
        notification_url: notificationUrl,
        ...rest,
      },
      payload,
    );
  },
});

export const cloudinaryUploadChunk = tool({
  description:
    'Upload one chunk of a large file. Reuse the same upload ID for all chunks; the last chunk returns the asset.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    file: z.string().describe('Chunk bytes as base64 (data URI accepted)'),
    contentRange: z.string().describe('Byte range, e.g. "bytes 0-999999/3000000"'),
    xUniqueUploadId: z.string().describe('Upload session ID shared by all chunks of the file'),
    fileName: z.string().optional().describe('File name for the completed asset'),
    contentType: z.string().optional().describe('MIME type of the file'),
    resourceType: z
      .enum(['image', 'video', 'raw', 'auto'])
      .optional()
      .describe('Resource type (default auto)'),
    publicId: z.string().optional().describe('Public ID for the completed asset'),
    folder: z.string().optional().describe('Destination folder'),
    tags: z.string().optional().describe('Comma-separated tags'),
    uploadPreset: z.string().optional().describe('Upload preset to apply'),
    notificationUrl: z.string().optional().describe('Webhook notified on completion'),
  }),
  execute: ({
    cloudinaryCredentials,
    file,
    contentRange,
    xUniqueUploadId,
    fileName,
    contentType,
    resourceType,
    publicId,
    folder,
    tags,
    uploadPreset,
    notificationUrl,
  }) =>
    cldUpload(
      parseCreds(cloudinaryCredentials),
      resourceType ?? 'auto',
      'upload',
      {
        public_id: publicId,
        folder,
        tags,
        upload_preset: uploadPreset,
        notification_url: notificationUrl,
      },
      { fileName, fileContentBase64: file, contentType },
      { 'Content-Range': contentRange, 'X-Unique-Upload-Id': xUniqueUploadId },
    ),
});

export const cloudinaryCreateImageFromText = tool({
  description: 'Generate a styled text image (banners, captions) via the text generation endpoint.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    text: z.string().describe('Text to render into an image'),
    publicId: z.string().optional().describe('Public ID for the generated image'),
    fontFamily: z.string().optional().describe('Font family, e.g. "Arial"'),
    fontSize: z.number().int().min(1).optional().describe('Font size in points (default 12)'),
    fontColor: z.string().optional().describe('Font color name or rgb:RRGGBB (default black)'),
    fontWeight: z.enum(['normal', 'bold']).optional().describe('Font weight'),
    fontStyle: z.enum(['normal', 'italic']).optional().describe('Font style'),
    textAlign: z.enum(['left', 'center', 'right', 'justify']).optional().describe('Text alignment'),
    textDecoration: z.enum(['none', 'underline']).optional().describe('Text decoration'),
    background: z.string().optional().describe('Background color (default transparent)'),
    opacity: z
      .number()
      .int()
      .min(0)
      .max(100)
      .optional()
      .describe('Text opacity 0-100 (default 100)'),
    lineSpacing: z.number().int().min(0).optional().describe('Line spacing in pixels'),
  }),
  execute: ({
    cloudinaryCredentials,
    text,
    publicId,
    fontFamily,
    fontSize,
    fontColor,
    fontWeight,
    fontStyle,
    textAlign,
    textDecoration,
    background,
    opacity,
    lineSpacing,
  }) =>
    cldUpload(parseCreds(cloudinaryCredentials), 'image', 'text', {
      text,
      public_id: publicId,
      font_family: fontFamily,
      font_size: fontSize,
      font_color: fontColor,
      font_weight: fontWeight,
      font_style: fontStyle,
      text_align: textAlign,
      text_decoration: textDecoration,
      background,
      opacity,
      line_spacing: lineSpacing,
    }),
});

export const cloudinaryCreateMultiResource = tool({
  description:
    'Combine images into an animated GIF/MP4/WebM, video, PDF, or sprite-like multi asset by tag or URLs.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    tag: z
      .string()
      .optional()
      .describe('Combine all images carrying this tag (exclusive with urls)'),
    urls: z.array(z.string()).optional().describe('Image URLs to combine (exclusive with tag)'),
    format: z
      .enum(['gif', 'mp4', 'webm', 'pdf', 'png', 'webp'])
      .optional()
      .describe('Output format'),
    resourceType: z
      .enum(['image', 'video'])
      .optional()
      .describe('Output resource type (default image)'),
    transformation: z
      .string()
      .optional()
      .describe('Transformation on the result, e.g. "w_640,h_480,c_fill"'),
    notificationUrl: z.string().optional().describe('Webhook notified on completion'),
  }),
  execute: ({
    cloudinaryCredentials,
    tag,
    urls,
    format,
    resourceType,
    transformation,
    notificationUrl,
  }) => {
    if (!tag && !urls) return { error: 'Provide tag or urls.' };
    return cldUpload(parseCreds(cloudinaryCredentials), resourceType ?? 'image', 'multi', {
      tag,
      urls,
      format,
      transformation,
      notification_url: notificationUrl,
    });
  },
});

export const cloudinaryCreateSlideshow = tool({
  description:
    'Generate a video slideshow from assets via a manifest JSON (async; poll or use notification URL).',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    manifestJson: z
      .string()
      .describe(
        'Stringified slideshow spec: {w,h,du,fps,vars:{sdur,tdur,slides:[{media:"i:sample"}]}}',
      ),
    publicId: z.string().optional().describe('Public ID for the slideshow video'),
    tags: z.array(z.string()).optional().describe('Tags for the generated video'),
    transformation: z
      .array(z.string())
      .optional()
      .describe('Transformations to apply to the slideshow'),
    uploadPreset: z.string().optional().describe('Upload preset to apply'),
    overwrite: z
      .boolean()
      .optional()
      .describe('Overwrite an existing slideshow with the same public ID'),
    notificationUrl: z.string().optional().describe('Webhook notified on completion'),
  }),
  execute: ({
    cloudinaryCredentials,
    manifestJson,
    publicId,
    tags,
    transformation,
    uploadPreset,
    overwrite,
    notificationUrl,
  }) =>
    cldUpload(parseCreds(cloudinaryCredentials), 'video', 'slideshow', {
      manifest_json: manifestJson,
      public_id: publicId,
      tags: tags?.join(','),
      transformation: transformation?.join('|'),
      upload_preset: uploadPreset,
      overwrite,
      notification_url: notificationUrl,
    }),
});

export const cloudinaryGenerateSprite = tool({
  description:
    'Merge images into a CSS sprite sheet (deprecated by Cloudinary in 2025; may be unavailable).',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    tag: z.string().optional().describe('Images carrying this tag (exclusive with urls)'),
    urls: z.array(z.string()).optional().describe('Image URLs to merge (exclusive with tag)'),
    resourceType: z
      .enum(['image', 'video', 'raw'])
      .optional()
      .describe('Resource type (default image)'),
    transformation: z.string().optional().describe('Transformation applied to each image first'),
    async: z.boolean().optional().describe('Generate asynchronously for large sets'),
    notificationUrl: z.string().optional().describe('Webhook notified on completion'),
  }),
  execute: ({
    cloudinaryCredentials,
    tag,
    urls,
    resourceType,
    transformation,
    async,
    notificationUrl,
  }) =>
    cldUpload(parseCreds(cloudinaryCredentials), resourceType ?? 'image', 'sprite', {
      tag,
      urls,
      transformation,
      async,
      notification_url: notificationUrl,
    }),
});

export const cloudinaryGenerateArchive = tool({
  description: 'Bundle assets into a ZIP/TGZ archive by IDs, prefix, or tags (async supported).',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    resourceType: z.enum(['image', 'video', 'raw', 'all']).describe('Asset types to include'),
    publicIds: z.array(z.string()).optional().describe('Specific public IDs to include'),
    prefixes: z.array(z.string()).optional().describe('Public ID prefixes to include'),
    tags: z.array(z.string()).optional().describe('Tags to include'),
    type: z.string().optional().describe('Delivery type of assets to include'),
    targetFormat: z.enum(['zip', 'tgz']).optional().describe('Archive format'),
    targetPublicId: z.string().optional().describe('Public ID for the archive file'),
    targetAssetFolder: z.string().optional().describe('Folder storing the archive'),
    targetTags: z.array(z.string()).optional().describe('Tags assigned to the archive'),
    mode: z
      .string()
      .optional()
      .describe('"create" always rebuilds; "download" reuses an existing archive'),
    async: z.boolean().optional().describe('Generate in the background'),
    keepDerived: z.boolean().optional().describe('Include derived versions'),
    allowMissing: z.boolean().optional().describe('Tolerate missing assets'),
    flattenFolders: z.boolean().optional().describe('Flatten folder structure inside the archive'),
    flattenTransformations: z.boolean().optional().describe('Flatten transformation directories'),
    skipTransformationName: z
      .boolean()
      .optional()
      .describe('Omit transformation names from filenames'),
    useOriginalFilename: z
      .boolean()
      .optional()
      .describe('Use original filenames instead of public IDs'),
    transformations: z.string().optional().describe('Transformation applied to assets first'),
    expiresAt: z.number().int().optional().describe('Unix timestamp when the archive auto-deletes'),
    notificationUrl: z.string().optional().describe('Webhook notified on completion'),
  }),
  execute: ({
    cloudinaryCredentials,
    resourceType,
    targetFormat,
    targetPublicId,
    targetAssetFolder,
    targetTags,
    keepDerived,
    allowMissing,
    flattenFolders,
    flattenTransformations,
    skipTransformationName,
    useOriginalFilename,
    expiresAt,
    notificationUrl,
    ...rest
  }) =>
    cldUpload(
      parseCreds(cloudinaryCredentials),
      resourceType === 'all' ? 'image' : resourceType,
      'generate_archive',
      {
        ...rest,
        target_format: targetFormat,
        target_public_id: targetPublicId,
        target_asset_folder: targetAssetFolder,
        target_tags: targetTags,
        keep_derived: keepDerived,
        allow_missing: allowMissing,
        flatten_folders: flattenFolders,
        flatten_transformations: flattenTransformations,
        skip_transformation_name: skipTransformationName,
        use_original_filename: useOriginalFilename,
        expires_at: expiresAt,
        notification_url: notificationUrl,
      },
    ),
});

export const cloudinaryExplodeResource = tool({
  description:
    'Split a multi-page file (PDF, PSD, TIFF, animated GIF) into per-page images (async, returns batch ID).',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    publicId: z.string().describe('Public ID of the multi-page asset'),
    transformation: z.string().describe('Must include pg_all, e.g. "pg_all,w_300,h_400,c_fill"'),
    resourceType: z.string().optional().describe('Resource type (default image)'),
    type: z.string().optional().describe('Delivery type (default upload)'),
    format: z.string().optional().describe('Output format for pages, e.g. "jpg"'),
    notificationUrl: z.string().optional().describe('Webhook notified on completion'),
  }),
  execute: ({
    cloudinaryCredentials,
    publicId,
    transformation,
    resourceType,
    type,
    format,
    notificationUrl,
  }) =>
    cldUpload(parseCreds(cloudinaryCredentials), resourceType ?? 'image', 'explode', {
      public_id: publicId,
      transformation,
      type,
      format,
      notification_url: notificationUrl,
    }),
});
