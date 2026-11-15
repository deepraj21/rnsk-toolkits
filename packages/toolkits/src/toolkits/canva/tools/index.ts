// @ts-nocheck
import { canvaCreateAssetUploadJob } from './create-asset-upload-job.js';
import { canvaCreateCommentReply } from './create-comment-reply.js';
import { canvaCreateCommentThread } from './create-comment-thread.js';
import { canvaCreateDesign } from './create-design.js';
import { canvaCreateDesignAutofillJob } from './create-design-autofill-job.js';
import { canvaCreateDesignExportJob } from './create-design-export-job.js';
import { canvaCreateDesignGenerationJob } from './create-design-generation-job.js';
import { canvaCreateDesignImportJob } from './create-design-import-job.js';
import { canvaCreateFolder } from './create-folder.js';
import { canvaCreateImageGenerationJob } from './create-image-generation-job.js';
import { canvaCreateUrlAssetUploadJob } from './create-url-asset-upload-job.js';
import { canvaCreateUrlImportJob } from './create-url-import-job.js';
import { canvaDeleteAsset } from './delete-asset.js';
import { canvaDeleteFolder } from './delete-folder.js';
import { canvaGetAsset } from './get-asset.js';
import { canvaGetAssetUploadJob } from './get-asset-upload-job.js';
import { canvaGetAuthenticatedUser } from './get-authenticated-user.js';
import { canvaGetBrandTemplate } from './get-brand-template.js';
import { canvaGetBrandTemplateDataset } from './get-brand-template-dataset.js';
import { canvaGetCommentThread } from './get-comment-thread.js';
import { canvaGetDesign } from './get-design.js';
import { canvaGetDesignAutofillJob } from './get-design-autofill-job.js';
import { canvaGetDesignDataset } from './get-design-dataset.js';
import { canvaGetDesignExportFormats } from './get-design-export-formats.js';
import { canvaGetDesignExportJob } from './get-design-export-job.js';
import { canvaGetDesignGenerationJob } from './get-design-generation-job.js';
import { canvaGetDesignImportJob } from './get-design-import-job.js';
import { canvaGetDesignPages } from './get-design-pages.js';
import { canvaGetFolder } from './get-folder.js';
import { canvaGetImageGenerationJob } from './get-image-generation-job.js';
import { canvaGetUrlAssetUploadJob } from './get-url-asset-upload-job.js';
import { canvaGetUrlImportJob } from './get-url-import-job.js';
import { canvaGetUserCapabilities } from './get-user-capabilities.js';
import { canvaGetUserProfile } from './get-user-profile.js';
import { canvaListBrandTemplates } from './list-brand-templates.js';
import { canvaListCommentReplies } from './list-comment-replies.js';
import { canvaListDesigns } from './list-designs.js';
import { canvaListFolderItems } from './list-folder-items.js';
import { canvaMoveFolderItem } from './move-folder-item.js';
import { canvaPublishBrandTemplate } from './publish-brand-template.js';
import { canvaUpdateAsset } from './update-asset.js';
import { canvaUpdateFolder } from './update-folder.js';

export {
  canvaCreateAssetUploadJob,
  canvaCreateCommentReply,
  canvaCreateCommentThread,
  canvaCreateDesign,
  canvaCreateDesignAutofillJob,
  canvaCreateDesignExportJob,
  canvaCreateDesignGenerationJob,
  canvaCreateDesignImportJob,
  canvaCreateFolder,
  canvaCreateImageGenerationJob,
  canvaCreateUrlAssetUploadJob,
  canvaCreateUrlImportJob,
  canvaDeleteAsset,
  canvaDeleteFolder,
  canvaGetAsset,
  canvaGetAssetUploadJob,
  canvaGetAuthenticatedUser,
  canvaGetBrandTemplate,
  canvaGetBrandTemplateDataset,
  canvaGetCommentThread,
  canvaGetDesign,
  canvaGetDesignAutofillJob,
  canvaGetDesignDataset,
  canvaGetDesignExportFormats,
  canvaGetDesignExportJob,
  canvaGetDesignGenerationJob,
  canvaGetDesignImportJob,
  canvaGetDesignPages,
  canvaGetFolder,
  canvaGetImageGenerationJob,
  canvaGetUrlAssetUploadJob,
  canvaGetUrlImportJob,
  canvaGetUserCapabilities,
  canvaGetUserProfile,
  canvaListBrandTemplates,
  canvaListCommentReplies,
  canvaListDesigns,
  canvaListFolderItems,
  canvaMoveFolderItem,
  canvaPublishBrandTemplate,
  canvaUpdateAsset,
  canvaUpdateFolder,
};

export const canvaTools = [
  {
    name: 'canvaListDesigns',
    description:
      "Lists the connected user's Canva designs (id, title, owner, page count, thumbnail, edit/view URLs). Search by keyword, filter by ownership, sort, and page through results using the returned continuation token. Use canvaGetDesign for full details of one design.",
    tool: canvaListDesigns,
    requiredAuth: 'canvaToken' as const,
    scope: 'read' as const,
    keywords: ['canva', 'projects', 'browse', 'recent', 'search'],
  },
  {
    name: 'canvaCreateDesign',
    description:
      'Creates a new Canva design and returns it (id, title, edit/view URLs). Choose one mode: a preset design type (doc, presentation, whiteboard, email) optionally seeded with an asset_id, a copy of an existing design (copyDesignId), or a design from a brand template (brandTemplateId). Blank designs not edited within 7 days are auto-deleted by Canva.',
    tool: canvaCreateDesign,
    requiredAuth: 'canvaToken' as const,
    scope: 'write' as const,
    keywords: ['canva', 'blank', 'new', 'presentation', 'whiteboard'],
  },
  {
    name: 'canvaGetDesign',
    description:
      'Fetches full metadata for one Canva design by ID: title, owner, page count, design types, thumbnail, and edit/view URLs. Use the ID returned by canvaListDesigns or canvaCreateDesign.',
    tool: canvaGetDesign,
    requiredAuth: 'canvaToken' as const,
    scope: 'read' as const,
    keywords: ['canva', 'metadata', 'thumbnail', 'edit url', 'page count'],
  },
  {
    name: 'canvaGetDesignPages',
    description:
      'Lists the pages of a Canva design (page number, thumbnail, embedded elements) with offset/limit paging. Use when you need per-page detail beyond the page count on a design.',
    tool: canvaGetDesignPages,
    requiredAuth: 'canvaToken' as const,
    scope: 'read' as const,
    keywords: ['canva', 'slides', 'elements', 'thumbnails'],
  },
  {
    name: 'canvaGetDesignExportFormats',
    description:
      'Lists the export formats a design supports (pdf, jpg, png, svg, pptx, gif, mp4, html, csv) and the page numbers that work with each. Check this before starting an export job so the format matches the design.',
    tool: canvaGetDesignExportFormats,
    requiredAuth: 'canvaToken' as const,
    scope: 'read' as const,
    keywords: ['canva', 'download', 'file types', 'pdf', 'png'],
  },
  {
    name: 'canvaGetDesignDataset',
    description:
      'Returns the autofill dataset definition of a design: the data fields (text, image, chart, etc.) available for filling. Field names and types are exactly what canvaCreateDesignAutofillJob expects in its data object.',
    tool: canvaGetDesignDataset,
    requiredAuth: 'canvaToken' as const,
    scope: 'read' as const,
    keywords: ['canva', 'autofill', 'fields', 'inputs'],
  },
  {
    name: 'canvaCreateDesignExportJob',
    description:
      'Starts an export job for a Canva design (async) and returns the job with its ID and in_progress status. format.type selects the output: pdf, jpg, png, pptx, gif, mp4, csv, html_bundle, or html_standalone — plus options like pages, size, width/height, quality, export_quality. Poll canvaGetDesignExportJob until status is success.',
    tool: canvaCreateDesignExportJob,
    requiredAuth: 'canvaToken' as const,
    scope: 'write' as const,
    keywords: ['canva', 'download', 'render', 'convert', 'pdf'],
  },
  {
    name: 'canvaGetDesignExportJob',
    description:
      'Checks an export job started with canvaCreateDesignExportJob. On success returns download URLs (one per exported page); URLs expire after 24 hours. Job status is in_progress until Canva finishes — poll until success or failed.',
    tool: canvaGetDesignExportJob,
    requiredAuth: 'canvaToken' as const,
    scope: 'read' as const,
    keywords: ['canva', 'download', 'urls', 'render', 'status'],
  },
  {
    name: 'canvaListFolderItems',
    description:
      'Lists the contents of a Canva folder: designs, subfolders, images, and brand templates (id, name/type, thumbnail). Use folderId "root" for the top level of Projects or "uploads" for the Uploads folder. Supports filtering by item type, sorting, pinned status, and continuation-token paging.',
    tool: canvaListFolderItems,
    requiredAuth: 'canvaToken' as const,
    scope: 'read' as const,
    keywords: ['canva', 'browse', 'contents', 'projects', 'files'],
  },
  {
    name: 'canvaGetFolder',
    description:
      'Fetches metadata for one Canva folder by ID: name, parent folder, and created/updated timestamps. Use with canvaListFolderItems to browse folder structure.',
    tool: canvaGetFolder,
    requiredAuth: 'canvaToken' as const,
    scope: 'read' as const,
    keywords: ['canva', 'directory', 'parent', 'name'],
  },
  {
    name: 'canvaCreateFolder',
    description:
      'Creates a new Canva folder and returns it (id, name, created_at). parentFolderId places it: "root" for the top level of Projects, "uploads" for the Uploads folder, or another folder ID to nest it. Rate limited to 20 creates per minute per user.',
    tool: canvaCreateFolder,
    requiredAuth: 'canvaToken' as const,
    scope: 'write' as const,
    keywords: ['canva', 'directory', 'organize', 'new folder'],
  },
  {
    name: 'canvaUpdateFolder',
    description:
      'Renames a Canva folder (the only mutable field is the name) and returns the updated folder. Use canvaGetFolder first if you need the current name.',
    tool: canvaUpdateFolder,
    requiredAuth: 'canvaToken' as const,
    scope: 'write' as const,
    keywords: ['canva', 'rename', 'directory'],
  },
  {
    name: 'canvaMoveFolderItem',
    description:
      'Moves a Canva item (design, folder, image asset, or brand template) into another folder. Use toFolderId "root" to move it to the top level of Projects. Returns 204 on success. Fails with item_in_multiple_folders if the item lives in several folders — move it via the Canva UI in that case.',
    tool: canvaMoveFolderItem,
    requiredAuth: 'canvaToken' as const,
    scope: 'write' as const,
    keywords: ['canva', 'relocate', 'transfer', 'organize'],
  },
  {
    name: 'canvaDeleteFolder',
    description:
      'Deletes a Canva folder permanently (the folder and its contents are moved to trash/deleted — contents are not preserved separately). Cannot delete "root" or "uploads". This is not undoable from the API.',
    tool: canvaDeleteFolder,
    requiredAuth: 'canvaToken' as const,
    scope: 'delete' as const,
    keywords: ['canva', 'remove', 'trash', 'erase'],
  },
  {
    name: 'canvaCreateAssetUploadJob',
    description:
      "Starts an async job that uploads a file (image/video) into the user's Canva Uploads from raw bytes. Pass file content as utf8 text or base64 for binary; the name is sent base64-encoded in the Asset-Upload-Metadata header. Returns a job — poll canvaGetAssetUploadJob until status is success to get the asset ID for designs and autofill.",
    tool: canvaCreateAssetUploadJob,
    requiredAuth: 'canvaToken' as const,
    scope: 'write' as const,
    keywords: ['canva', 'image', 'video', 'binary', 'file'],
  },
  {
    name: 'canvaGetAssetUploadJob',
    description:
      'Checks an asset upload job started with canvaCreateAssetUploadJob. On success returns the asset (id, name, tags, thumbnail); on failure returns the error code (file_too_big, import_failed, fetch_failed). Poll until status is success or failed.',
    tool: canvaGetAssetUploadJob,
    requiredAuth: 'canvaToken' as const,
    scope: 'read' as const,
    keywords: ['canva', 'status', 'progress', 'upload'],
  },
  {
    name: 'canvaCreateUrlAssetUploadJob',
    description:
      "Starts an async job that fetches an image/video from a public URL and uploads it into the user's Canva Uploads — no need to pass file bytes. Returns a job — poll canvaGetUrlAssetUploadJob until status is success to get the asset ID. The URL must be internet-accessible.",
    tool: canvaCreateUrlAssetUploadJob,
    requiredAuth: 'canvaToken' as const,
    scope: 'write' as const,
    keywords: ['canva', 'image', 'video', 'fetch', 'remote'],
  },
  {
    name: 'canvaGetUrlAssetUploadJob',
    description:
      'Checks a URL asset upload job started with canvaCreateUrlAssetUploadJob. On success returns the asset (id, name, tags, thumbnail); on failure returns the error code. Poll until status is success or failed.',
    tool: canvaGetUrlAssetUploadJob,
    requiredAuth: 'canvaToken' as const,
    scope: 'read' as const,
    keywords: ['canva', 'status', 'progress', 'remote'],
  },
  {
    name: 'canvaGetAsset',
    description:
      'Fetches metadata for one Canva asset by ID: name, type (image/video), tags, owner, timestamps, thumbnail, and dimensions. Use the asset ID returned by the asset upload jobs or canvaListFolderItems.',
    tool: canvaGetAsset,
    requiredAuth: 'canvaToken' as const,
    scope: 'read' as const,
    keywords: ['canva', 'image', 'video', 'metadata', 'thumbnail'],
  },
  {
    name: 'canvaUpdateAsset',
    description:
      'Updates a Canva asset: rename it and/or replace its tags (fields you omit are left unchanged; an empty tags array clears all tags). Tags are what users search by in the Canva UI. Returns the updated asset.',
    tool: canvaUpdateAsset,
    requiredAuth: 'canvaToken' as const,
    scope: 'write' as const,
    keywords: ['canva', 'rename', 'label', 'organize'],
  },
  {
    name: 'canvaDeleteAsset',
    description:
      "Deletes an asset from the user's Canva Uploads permanently. Designs that already embed the asset keep a flattened copy, but future autofill/jobs referencing this asset ID will fail. This is not undoable.",
    tool: canvaDeleteAsset,
    requiredAuth: 'canvaToken' as const,
    scope: 'delete' as const,
    keywords: ['canva', 'remove', 'trash', 'image', 'video'],
  },
  {
    name: 'canvaCreateDesignImportJob',
    description:
      'Starts an async job that imports an external file (PPTX, PDF, DOCX, JPEG, PNG, etc.) as a new Canva design. Pass file bytes as utf8 or base64; the title (max 50 chars) is sent base64-encoded in the Import-Metadata header. Returns a job — poll canvaGetDesignImportJob until status is success to get the new design ID.',
    tool: canvaCreateDesignImportJob,
    requiredAuth: 'canvaToken' as const,
    scope: 'write' as const,
    keywords: ['canva', 'upload', 'file', 'pptx', 'pdf'],
  },
  {
    name: 'canvaGetDesignImportJob',
    description:
      'Checks a design import job started with canvaCreateDesignImportJob. On success returns the imported design (id, title, URLs); on failure returns the error. Poll until status is success or failed.',
    tool: canvaGetDesignImportJob,
    requiredAuth: 'canvaToken' as const,
    scope: 'read' as const,
    keywords: ['canva', 'status', 'progress', 'file'],
  },
  {
    name: 'canvaCreateUrlImportJob',
    description:
      'Starts an async job that imports a file from a public URL as a new Canva design — no need to pass file bytes. The URL must be internet-accessible; MIME type is auto-detected unless you set it. Returns a job — poll canvaGetUrlImportJob until status is success to get the new design ID.',
    tool: canvaCreateUrlImportJob,
    requiredAuth: 'canvaToken' as const,
    scope: 'write' as const,
    keywords: ['canva', 'upload', 'remote', 'fetch', 'pptx'],
  },
  {
    name: 'canvaGetUrlImportJob',
    description:
      'Checks a URL design import job started with canvaCreateUrlImportJob. On success returns the imported design (id, title, URLs); on failure returns the error. Poll until status is success or failed.',
    tool: canvaGetUrlImportJob,
    requiredAuth: 'canvaToken' as const,
    scope: 'read' as const,
    keywords: ['canva', 'status', 'progress', 'remote'],
  },
  {
    name: 'canvaCreateCommentThread',
    description:
      'Starts a new comment thread on a Canva design and returns the thread (id, author, message). To assign the comment, mention the user in the message as [user_id:team_id] and pass assigneeId (get IDs from canvaGetAuthenticatedUser). Note: Canva has no endpoint to list all threads — keep the returned thread ID to read or reply later.',
    tool: canvaCreateCommentThread,
    requiredAuth: 'canvaToken' as const,
    scope: 'write' as const,
    keywords: ['canva', 'discuss', 'feedback', 'mention', 'assign'],
  },
  {
    name: 'canvaGetCommentThread',
    description:
      'Fetches one comment thread on a design by its thread ID: author, message, created/updated timestamps, resolved status, and replies. Use the thread ID returned by canvaCreateCommentThread (there is no list-threads endpoint).',
    tool: canvaGetCommentThread,
    requiredAuth: 'canvaToken' as const,
    scope: 'read' as const,
    keywords: ['canva', 'discuss', 'feedback', 'replies', 'conversation'],
  },
  {
    name: 'canvaListCommentReplies',
    description:
      'Lists the replies in a comment thread on a design (author, message, timestamps) with limit/continuation paging. Use after canvaCreateCommentThread or canvaGetCommentThread to follow a discussion.',
    tool: canvaListCommentReplies,
    requiredAuth: 'canvaToken' as const,
    scope: 'read' as const,
    keywords: ['canva', 'discussion', 'feedback', 'conversation'],
  },
  {
    name: 'canvaCreateCommentReply',
    description:
      'Adds a reply to an existing comment thread on a Canva design and returns the reply. Use the thread ID from canvaCreateCommentThread; mention users in the text as [user_id:team_id].',
    tool: canvaCreateCommentReply,
    requiredAuth: 'canvaToken' as const,
    scope: 'write' as const,
    keywords: ['canva', 'discuss', 'feedback', 'respond', 'mention'],
  },
  {
    name: 'canvaCreateDesignAutofillJob',
    description:
      'Starts an async autofill job that fills data fields in a design (text, images, charts) and returns the job. Modes: create_from_brand_template (brandTemplateId), create_from_design (designId) makes a new filled copy, update_design (designId) edits in place. data maps field names to values — get field names from canvaGetBrandTemplateDataset or canvaGetDesignDataset. Poll canvaGetDesignAutofillJob until success.',
    tool: canvaCreateDesignAutofillJob,
    requiredAuth: 'canvaToken' as const,
    scope: 'write' as const,
    keywords: ['canva', 'populate', 'fill', 'fields', 'merge data'],
  },
  {
    name: 'canvaGetDesignAutofillJob',
    description:
      'Checks an autofill job started with canvaCreateDesignAutofillJob. On success returns the created design (create modes) or the updated design (update_design mode); on failure returns the autofill error. Poll until status is success or failed.',
    tool: canvaGetDesignAutofillJob,
    requiredAuth: 'canvaToken' as const,
    scope: 'read' as const,
    keywords: ['canva', 'status', 'progress', 'populate'],
  },
  {
    name: 'canvaListBrandTemplates',
    description:
      'Lists the brand templates the user can access (id, title, view/create URLs, timestamps) with search, sorting, and continuation-token paging. Brand templates are the input for canvaCreateDesignAutofillJob and canvaPublishBrandTemplate.',
    tool: canvaListBrandTemplates,
    requiredAuth: 'canvaToken' as const,
    scope: 'read' as const,
    keywords: ['canva', 'brand kit', 'search', 'browse'],
  },
  {
    name: 'canvaGetBrandTemplate',
    description:
      'Fetches one brand template by ID: title, view/create URLs, thumbnail, and timestamps. Use its ID with canvaGetBrandTemplateDataset to discover autofill fields or canvaCreateDesignAutofillJob to generate designs from it.',
    tool: canvaGetBrandTemplate,
    requiredAuth: 'canvaToken' as const,
    scope: 'read' as const,
    keywords: ['canva', 'brand kit', 'metadata', 'thumbnail'],
  },
  {
    name: 'canvaGetBrandTemplateDataset',
    description:
      'Returns the autofill dataset definition of a brand template: the data fields (text, image, chart, etc.) with their types. Field names are exactly what canvaCreateDesignAutofillJob expects in its data object for create_from_brand_template mode.',
    tool: canvaGetBrandTemplateDataset,
    requiredAuth: 'canvaToken' as const,
    scope: 'read' as const,
    keywords: ['canva', 'fields', 'autofill', 'inputs', 'brand kit'],
  },
  {
    name: 'canvaPublishBrandTemplate',
    description:
      'Publishes a Canva design as a brand template (or updates the existing template if the design is its draft) and returns the brand template with view/create URLs. The thumbnail may be null right after publishing — fetch it later with canvaGetBrandTemplate. Requires the brand_template capability.',
    tool: canvaPublishBrandTemplate,
    requiredAuth: 'canvaToken' as const,
    scope: 'write' as const,
    keywords: ['canva', 'share', 'convert', 'make template'],
  },
  {
    name: 'canvaCreateDesignGenerationJob',
    description:
      'Starts an AI job that generates a full Canva design from a written brief and returns the job. designType is "doc" or "presentation"; for presentations you can pass an ordered outline (sections with title/description/points). Poll canvaGetDesignGenerationJob until status is success to get the generated design. Requires the design_generation capability.',
    tool: canvaCreateDesignGenerationJob,
    requiredAuth: 'canvaToken' as const,
    scope: 'write' as const,
    keywords: ['canva', 'ai', 'generate', 'outline', 'pitch deck'],
  },
  {
    name: 'canvaGetDesignGenerationJob',
    description:
      "Checks an AI design generation job started with canvaCreateDesignGenerationJob. On success returns the generated design (saved to the user's Canva account); on failure returns the error. Poll until status is success or failed.",
    tool: canvaGetDesignGenerationJob,
    requiredAuth: 'canvaToken' as const,
    scope: 'read' as const,
    keywords: ['canva', 'status', 'progress', 'ai'],
  },
  {
    name: 'canvaCreateImageGenerationJob',
    description:
      'Starts an AI image generation job and returns the job. idempotencyKey must be a fresh UUID (retries with the same key return the original job). Choose aspect ratio and optionally a model; assetUpload "upload" saves the result as an asset in Uploads, "none" only returns a download URL. Poll canvaGetImageGenerationJob until success. Requires the image_generation capability.',
    tool: canvaCreateImageGenerationJob,
    requiredAuth: 'canvaToken' as const,
    scope: 'write' as const,
    keywords: ['canva', 'ai', 'generate', 'picture', 'photo'],
  },
  {
    name: 'canvaGetImageGenerationJob',
    description:
      'Checks an image generation job started with canvaCreateImageGenerationJob. On success returns the image: a download URL (valid 24 hours) and, if asset_upload was "upload", the saved asset. Poll until status is success or failed.',
    tool: canvaGetImageGenerationJob,
    requiredAuth: 'canvaToken' as const,
    scope: 'read' as const,
    keywords: ['canva', 'status', 'progress', 'ai', 'picture'],
  },
  {
    name: 'canvaGetAuthenticatedUser',
    description:
      'Returns the user and team IDs behind the connected Canva access token. Use the user_id and team_id when mentioning users in comments ([user_id:team_id]) or attributing ownership.',
    tool: canvaGetAuthenticatedUser,
    requiredAuth: 'canvaToken' as const,
    scope: 'read' as const,
    keywords: ['canva', 'whoami', 'identity', 'team', 'account'],
  },
  {
    name: 'canvaGetUserProfile',
    description:
      'Returns the profile of the user behind the connected Canva access token — currently the display name. Use to confirm whose account is connected.',
    tool: canvaGetUserProfile,
    requiredAuth: 'canvaToken' as const,
    scope: 'read' as const,
    keywords: ['canva', 'identity', 'display name', 'account', 'me'],
  },
  {
    name: 'canvaGetUserCapabilities',
    description:
      'Lists the API capabilities the connected user has (analytics, autofill, brand_template, design_generation, image_generation, resize, export_png_transparency, …). Check this before calling capability-gated tools to predict which ones will succeed.',
    tool: canvaGetUserCapabilities,
    requiredAuth: 'canvaToken' as const,
    scope: 'read' as const,
    keywords: ['canva', 'permissions', 'features', 'entitlements', 'access'],
  },
];
