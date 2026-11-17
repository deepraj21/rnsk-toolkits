// @ts-nocheck
import type { ToolDefinition } from '../../../core/types.js';
import { typeformGetUser } from './get-user.js';
import { typeformListForms } from './list-forms.js';
import { typeformCreateForm } from './create-form.js';
import { typeformGetForm } from './get-form.js';
import { typeformUpdateForm } from './update-form.js';
import { typeformPatchForm } from './patch-form.js';
import { typeformDeleteForm } from './delete-form.js';
import { typeformGetFormMessages } from './get-form-messages.js';
import { typeformUpdateFormMessages } from './update-form-messages.js';
import { typeformListResponses } from './list-responses.js';
import { typeformSearchResponses } from './search-responses.js';
import { typeformDeleteResponses } from './delete-responses.js';
import { typeformGetResponseFile } from './get-response-file.js';
import { typeformDownloadResponseFiles } from './download-response-files.js';
import { typeformListWebhooks } from './list-webhooks.js';
import { typeformGetWebhook } from './get-webhook.js';
import { typeformUpsertWebhook } from './upsert-webhook.js';
import { typeformDeleteWebhook } from './delete-webhook.js';
import { typeformListWebhookDeliveries } from './list-webhook-deliveries.js';
import { typeformGetWebhookDelivery } from './get-webhook-delivery.js';
import { typeformListThemes } from './list-themes.js';
import { typeformCreateTheme } from './create-theme.js';
import { typeformGetTheme } from './get-theme.js';
import { typeformUpdateTheme } from './update-theme.js';
import { typeformPatchTheme } from './patch-theme.js';
import { typeformDeleteTheme } from './delete-theme.js';
import { typeformListImages } from './list-images.js';
import { typeformCreateImage } from './create-image.js';
import { typeformGetImage } from './get-image.js';
import { typeformDeleteImage } from './delete-image.js';
import { typeformRequestVideoUpload } from './request-video-upload.js';
import { typeformListVideos } from './list-videos.js';
import { typeformListWorkspaces } from './list-workspaces.js';
import { typeformCreateWorkspace } from './create-workspace.js';
import { typeformGetWorkspace } from './get-workspace.js';
import { typeformUpdateWorkspace } from './update-workspace.js';
import { typeformDeleteWorkspace } from './delete-workspace.js';
import { typeformListAccountWorkspaces } from './list-account-workspaces.js';
import { typeformCreateAccountWorkspace } from './create-account-workspace.js';

export {
  typeformGetUser,
  typeformListForms,
  typeformCreateForm,
  typeformGetForm,
  typeformUpdateForm,
  typeformPatchForm,
  typeformDeleteForm,
  typeformGetFormMessages,
  typeformUpdateFormMessages,
  typeformListResponses,
  typeformSearchResponses,
  typeformDeleteResponses,
  typeformGetResponseFile,
  typeformDownloadResponseFiles,
  typeformListWebhooks,
  typeformGetWebhook,
  typeformUpsertWebhook,
  typeformDeleteWebhook,
  typeformListWebhookDeliveries,
  typeformGetWebhookDelivery,
  typeformListThemes,
  typeformCreateTheme,
  typeformGetTheme,
  typeformUpdateTheme,
  typeformPatchTheme,
  typeformDeleteTheme,
  typeformListImages,
  typeformCreateImage,
  typeformGetImage,
  typeformDeleteImage,
  typeformRequestVideoUpload,
  typeformListVideos,
  typeformListWorkspaces,
  typeformCreateWorkspace,
  typeformGetWorkspace,
  typeformUpdateWorkspace,
  typeformDeleteWorkspace,
  typeformListAccountWorkspaces,
  typeformCreateAccountWorkspace,
};

export const typeformTools: ToolDefinition[] = [
  {
    name: 'typeformGetUser',
    description:
      'Gets the Typeform account behind the connected token — alias, email address, and language. Use this to confirm which account is connected. Needs accounts:read.',
    tool: typeformGetUser,
    requiredAuth: 'typeformToken' as const,
    scope: 'read' as const,
    keywords: ['typeform', 'account', 'profile', 'whoami', 'me'],
  },
  {
    name: 'typeformListForms',
    description:
      'Lists the typeforms in the account as a page of summaries (total_items/page_count) — filter by title search, workspace, or visibility, and sort by created or last updated. Use this to find form IDs, then typeformGetForm for the full definition. Needs forms:read.',
    tool: typeformListForms,
    requiredAuth: 'typeformToken' as const,
    scope: 'read' as const,
    keywords: ['typeform', 'forms', 'surveys', 'questionnaires', 'polls'],
  },
  {
    name: 'typeformCreateForm',
    description:
      'Creates a new typeform (survey) with an optional set of questions, settings, and destination workspace. Returns the created form definition including its ID. Referenced images must already exist in the account. Needs forms:write.',
    tool: typeformCreateForm,
    requiredAuth: 'typeformToken' as const,
    scope: 'write' as const,
    keywords: ['typeform', 'survey', 'questionnaire', 'poll', 'build'],
  },
  {
    name: 'typeformGetForm',
    description:
      'Gets the full definition of one typeform — title, fields (questions), settings, logic, welcome/thank-you screens, and workspace. Use this to inspect a form before editing it. Needs forms:read.',
    tool: typeformGetForm,
    requiredAuth: 'typeformToken' as const,
    scope: 'read' as const,
    keywords: ['typeform', 'survey', 'definition', 'fields', 'questions'],
  },
  {
    name: 'typeformUpdateForm',
    description:
      'Replaces the whole definition of a typeform (title, fields, settings, screens, logic) — omitted top-level sections are cleared. For small changes prefer typeformPatchForm. Needs forms:write.',
    tool: typeformUpdateForm,
    requiredAuth: 'typeformToken' as const,
    scope: 'write' as const,
    keywords: ['typeform', 'edit', 'replace', 'rename', 'survey'],
  },
  {
    name: 'typeformPatchForm',
    description:
      'Applies targeted operations to a typeform without replacing its whole definition — send a JSON array of { op, path, value } ops, e.g. replace /title or /settings/is_public. Paths: /title, /theme, /workspace, /settings/<key>. Needs forms:write.',
    tool: typeformPatchForm,
    requiredAuth: 'typeformToken' as const,
    scope: 'write' as const,
    keywords: ['typeform', 'partial', 'edit', 'json-patch', 'rename'],
  },
  {
    name: 'typeformDeleteForm',
    description:
      'Deletes a typeform permanently, along with its responses. This cannot be undone — confirm with the user first. Needs forms:write.',
    tool: typeformDeleteForm,
    requiredAuth: 'typeformToken' as const,
    scope: 'delete' as const,
    keywords: ['typeform', 'remove', 'archive', 'trash', 'survey'],
  },
  {
    name: 'typeformGetFormMessages',
    description:
      'Gets the customizable messages (UI copy) of a typeform — button labels, error texts, hints, and placeholders keyed by dotted names like "label.buttonHint.default". Use this before typeformUpdateFormMessages. Needs forms:read.',
    tool: typeformGetFormMessages,
    requiredAuth: 'typeformToken' as const,
    scope: 'read' as const,
    keywords: ['typeform', 'labels', 'buttons', 'errors', 'wording'],
  },
  {
    name: 'typeformUpdateFormMessages',
    description:
      'Replaces the customizable messages (UI copy) of a typeform — pass only the keys to change, e.g. { "label.buttonHint.default": "Start" }. Formatting is *bold*/_italic_; HTML is forbidden. Needs forms:write.',
    tool: typeformUpdateFormMessages,
    requiredAuth: 'typeformToken' as const,
    scope: 'write' as const,
    keywords: ['typeform', 'labels', 'buttons', 'errors', 'wording'],
  },
  {
    name: 'typeformListResponses',
    description:
      'Lists a form’s responses (submissions) as a page with totals — filter by date range, specific/excluded response IDs, completion state, phrase search, or restrict returned answers to certain fields. For filtering on answer values use typeformSearchResponses. Needs responses:read.',
    tool: typeformListResponses,
    requiredAuth: 'typeformToken' as const,
    scope: 'read' as const,
    keywords: ['typeform', 'submissions', 'answers', 'entries', 'results'],
  },
  {
    name: 'typeformSearchResponses',
    description:
      'Searches a form’s responses with structured filters combined with AND — on answer values (answers.<field_id>), timestamps, tags, hidden fields, metadata, or response IDs. Prefer over typeformListResponses when filtering by what respondents answered. Needs responses:read.',
    tool: typeformSearchResponses,
    requiredAuth: 'typeformToken' as const,
    scope: 'read' as const,
    keywords: ['typeform', 'filter', 'find', 'criteria', 'answers'],
  },
  {
    name: 'typeformDeleteResponses',
    description:
      'Deletes specific responses (submissions) from a form — up to 1000 response IDs per call. Permanent and irreversible; confirm with the user before calling. Needs responses:write.',
    tool: typeformDeleteResponses,
    requiredAuth: 'typeformToken' as const,
    scope: 'delete' as const,
    keywords: ['typeform', 'remove', 'purge', 'erase', 'submissions'],
  },
  {
    name: 'typeformGetResponseFile',
    description:
      'Gets a file a respondent uploaded in a response (file_upload field). Returns a descriptor with the file’s content type and download URL instead of raw bytes — fetch that URL with the Typeform token to download it. Needs responses:read.',
    tool: typeformGetResponseFile,
    requiredAuth: 'typeformToken' as const,
    scope: 'read' as const,
    keywords: ['typeform', 'upload', 'attachment', 'download', 'media'],
  },
  {
    name: 'typeformDownloadResponseFiles',
    description:
      'Downloads a ZIP archive of every file respondents have uploaded to a form. Returns a descriptor with the archive’s content type and URL instead of raw bytes (204 = no file-upload fields). Needs responses:read.',
    tool: typeformDownloadResponseFiles,
    requiredAuth: 'typeformToken' as const,
    scope: 'read' as const,
    keywords: ['typeform', 'uploads', 'attachments', 'zip', 'archive'],
  },
  {
    name: 'typeformListWebhooks',
    description:
      'Lists all webhooks registered on a form — URL, enabled flag, subscribed event types (form_response, form_response_partial), and tag. Use this to find webhook tags before updating or deleting one. Needs webhooks:read.',
    tool: typeformListWebhooks,
    requiredAuth: 'typeformToken' as const,
    scope: 'read' as const,
    keywords: ['typeform', 'callbacks', 'endpoints', 'integrations', 'subscriptions'],
  },
  {
    name: 'typeformGetWebhook',
    description:
      'Gets one webhook on a form by its tag — URL, enabled state, event types, secret, SSL verification, and timestamps. Needs webhooks:read.',
    tool: typeformGetWebhook,
    requiredAuth: 'typeformToken' as const,
    scope: 'read' as const,
    keywords: ['typeform', 'callback', 'endpoint', 'config', 'subscription'],
  },
  {
    name: 'typeformUpsertWebhook',
    description:
      'Creates or updates a webhook on a form, keyed by tag — set the target URL, which events to send (form_response, form_response_partial), and an optional HMAC signing secret. Updating an existing tag replaces its configuration. Needs webhooks:write.',
    tool: typeformUpsertWebhook,
    requiredAuth: 'typeformToken' as const,
    scope: 'write' as const,
    keywords: ['typeform', 'create', 'register', 'update', 'callback'],
  },
  {
    name: 'typeformDeleteWebhook',
    description:
      'Deletes a webhook from a form by its tag — the form stops sending events to that endpoint. Confirm with the user first. Needs webhooks:write.',
    tool: typeformDeleteWebhook,
    requiredAuth: 'typeformToken' as const,
    scope: 'delete' as const,
    keywords: ['typeform', 'remove', 'unsubscribe', 'callback', 'endpoint'],
  },
  {
    name: 'typeformListWebhookDeliveries',
    description:
      'Lists recent delivery attempts for a form’s webhook — payload status and response codes from your endpoint. Use this to debug why submissions are not arriving. Needs webhooks:read.',
    tool: typeformListWebhookDeliveries,
    requiredAuth: 'typeformToken' as const,
    scope: 'read' as const,
    keywords: ['typeform', 'attempts', 'debug', 'logs', 'status'],
  },
  {
    name: 'typeformGetWebhookDelivery',
    description:
      'Gets one webhook delivery attempt by ID — what payload was sent, when, and how your endpoint responded. Use after typeformListWebhookDeliveries to inspect a failed delivery. Needs webhooks:read.',
    tool: typeformGetWebhookDelivery,
    requiredAuth: 'typeformToken' as const,
    scope: 'read' as const,
    keywords: ['typeform', 'attempt', 'debug', 'logs', 'status'],
  },
  {
    name: 'typeformListThemes',
    description:
      'Lists the themes in the account as a page of summaries (total_items/page_count) — use the returned theme IDs with the other theme tools. Needs themes:read.',
    tool: typeformListThemes,
    requiredAuth: 'typeformToken' as const,
    scope: 'read' as const,
    keywords: ['typeform', 'design', 'styles', 'appearance', 'skins'],
  },
  {
    name: 'typeformCreateTheme',
    description:
      'Creates a theme in the account. Pass the theme definition directly — colors (answer/background/button/question hex), background (brightness, layout, image), fonts, and field styles. Needs themes:write.',
    tool: typeformCreateTheme,
    requiredAuth: 'typeformToken' as const,
    scope: 'write' as const,
    keywords: ['typeform', 'design', 'colors', 'fonts', 'style'],
  },
  {
    name: 'typeformGetTheme',
    description:
      'Gets the full definition of one theme — colors, background, fonts, and field styles. Use this before updating a theme. Needs themes:read.',
    tool: typeformGetTheme,
    requiredAuth: 'typeformToken' as const,
    scope: 'read' as const,
    keywords: ['typeform', 'design', 'colors', 'fonts', 'style'],
  },
  {
    name: 'typeformUpdateTheme',
    description:
      'Replaces the whole definition of a theme (colors, background, fonts, field styles) — sections you omit are cleared. For small changes prefer typeformPatchTheme. Needs themes:write.',
    tool: typeformUpdateTheme,
    requiredAuth: 'typeformToken' as const,
    scope: 'write' as const,
    keywords: ['typeform', 'design', 'colors', 'fonts', 'style'],
  },
  {
    name: 'typeformPatchTheme',
    description:
      'Partially updates a theme — send only the sections to change (e.g. { colors: { button: "#FF0000" } }) and everything else stays as-is. Needs themes:write.',
    tool: typeformPatchTheme,
    requiredAuth: 'typeformToken' as const,
    scope: 'write' as const,
    keywords: ['typeform', 'design', 'colors', 'fonts', 'style'],
  },
  {
    name: 'typeformDeleteTheme',
    description:
      'Deletes a theme from the account. Forms using it keep their applied copy; only the saved theme is removed. Confirm with the user first. Needs themes:write.',
    tool: typeformDeleteTheme,
    requiredAuth: 'typeformToken' as const,
    scope: 'delete' as const,
    keywords: ['typeform', 'remove', 'design', 'styles', 'skins'],
  },
  {
    name: 'typeformListImages',
    description:
      'Lists the images in the Typeform account — the reusable assets that form fields, screens, and themes reference by URL. Needs images:read.',
    tool: typeformListImages,
    requiredAuth: 'typeformToken' as const,
    scope: 'read' as const,
    keywords: ['typeform', 'media', 'pictures', 'assets', 'photos'],
  },
  {
    name: 'typeformCreateImage',
    description:
      'Adds an image to the Typeform account so forms can reference it — from a public URL or base64 data with a file name. Returns the new image URL in the Location field for use in field/screen attachments. Needs images:write.',
    tool: typeformCreateImage,
    requiredAuth: 'typeformToken' as const,
    scope: 'write' as const,
    keywords: ['typeform', 'upload', 'media', 'picture', 'asset'],
  },
  {
    name: 'typeformGetImage',
    description:
      'Gets metadata for one image in the account — its URL, dimensions, and file details. Needs images:read.',
    tool: typeformGetImage,
    requiredAuth: 'typeformToken' as const,
    scope: 'read' as const,
    keywords: ['typeform', 'media', 'picture', 'asset', 'details'],
  },
  {
    name: 'typeformDeleteImage',
    description:
      'Deletes an image from the account. Forms still referencing its URL will show a broken image — confirm with the user first. Needs images:write.',
    tool: typeformDeleteImage,
    requiredAuth: 'typeformToken' as const,
    scope: 'delete' as const,
    keywords: ['typeform', 'remove', 'media', 'picture', 'asset'],
  },
  {
    name: 'typeformRequestVideoUpload',
    description:
      'Requests a signed upload URL for a video that belongs to a form field — returns the video ID and a temporary upload_url (expires in ~24 hours) that you PUT the video file to. Needs images:write.',
    tool: typeformRequestVideoUpload,
    requiredAuth: 'typeformToken' as const,
    scope: 'write' as const,
    keywords: ['typeform', 'media', 'signed', 'transcode', 'captions'],
  },
  {
    name: 'typeformListVideos',
    description:
      'Fetches videos attached to a form with their transcode status, duration, and preview URLs — optionally request instant clips by giving start/end times per video, or filter by status. Needs images:read.',
    tool: typeformListVideos,
    requiredAuth: 'typeformToken' as const,
    scope: 'read' as const,
    keywords: ['typeform', 'media', 'clips', 'transcode', 'captions'],
  },
  {
    name: 'typeformListWorkspaces',
    description:
      'Lists every workspace the connected account can access across organizations — ID, name, owning account, shared flag, and form count. Use the IDs for form moves and the other workspace tools. Needs workspaces:read.',
    tool: typeformListWorkspaces,
    requiredAuth: 'typeformToken' as const,
    scope: 'read' as const,
    keywords: ['typeform', 'folders', 'teams', 'organization', 'spaces'],
  },
  {
    name: 'typeformCreateWorkspace',
    description:
      'Creates a new workspace in the account — returns its ID, which you can pass as workspaceId to typeformCreateForm. Needs workspaces:write.',
    tool: typeformCreateWorkspace,
    requiredAuth: 'typeformToken' as const,
    scope: 'write' as const,
    keywords: ['typeform', 'folder', 'team', 'space', 'new'],
  },
  {
    name: 'typeformGetWorkspace',
    description:
      'Gets one workspace by ID — name, owning account, shared flag, and the count/link of typeforms it holds. Needs workspaces:read.',
    tool: typeformGetWorkspace,
    requiredAuth: 'typeformToken' as const,
    scope: 'read' as const,
    keywords: ['typeform', 'folder', 'team', 'space', 'details'],
  },
  {
    name: 'typeformUpdateWorkspace',
    description:
      'Updates a workspace with operations — rename it ({ op: "replace", path: "/name" }) or add/remove members ({ op: "add", path: "/members", value: { email, role } }). Send the ops as a JSON array. Needs workspaces:write.',
    tool: typeformUpdateWorkspace,
    requiredAuth: 'typeformToken' as const,
    scope: 'write' as const,
    keywords: ['typeform', 'rename', 'members', 'folder', 'team'],
  },
  {
    name: 'typeformDeleteWorkspace',
    description:
      'Deletes a workspace. The forms inside it are not deleted but may become harder to find — confirm with the user first. Needs workspaces:write.',
    tool: typeformDeleteWorkspace,
    requiredAuth: 'typeformToken' as const,
    scope: 'delete' as const,
    keywords: ['typeform', 'remove', 'folder', 'team', 'space'],
  },
  {
    name: 'typeformListAccountWorkspaces',
    description:
      'Lists the workspaces inside one Typeform organization (account) — use when you know the account ID and want only that organization’s workspaces rather than every workspace across organizations. Needs workspaces:read.',
    tool: typeformListAccountWorkspaces,
    requiredAuth: 'typeformToken' as const,
    scope: 'read' as const,
    keywords: ['typeform', 'organization', 'org', 'teams', 'spaces'],
  },
  {
    name: 'typeformCreateAccountWorkspace',
    description:
      'Creates a new workspace inside a specific Typeform organization (account) — returns its ID for use with the form and workspace tools. Needs workspaces:write.',
    tool: typeformCreateAccountWorkspace,
    requiredAuth: 'typeformToken' as const,
    scope: 'write' as const,
    keywords: ['typeform', 'organization', 'org', 'team', 'space'],
  },
];
