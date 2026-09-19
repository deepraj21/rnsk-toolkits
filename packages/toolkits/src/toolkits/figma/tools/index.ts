// @ts-nocheck
import { addCommentToAFile } from './add-comment-to-a-file.js';
import { addReactionToAComment } from './add-reaction-to-a-comment.js';
import { createAWebhook } from './create-a-webhook.js';
import { createDevResources } from './create-dev-resources.js';
import { createModifyDeleteVariables } from './create-modify-delete-variables.js';
import { deleteAComment } from './delete-a-comment.js';
import { deleteAReaction } from './delete-a-reaction.js';
import { deleteAWebhook } from './delete-a-webhook.js';
import { deleteDevResource } from './delete-dev-resource.js';
import { designTokensToTailwind } from './design-tokens-to-tailwind.js';
import { detectBackground } from './detect-background.js';
import { discoverFigmaResources } from './discover-figma-resources.js';
import { downloadFigmaImages } from './download-figma-images.js';
import { extractDesignTokens } from './extract-design-tokens.js';
import { extractPrototypeInteractions } from './extract-prototype-interactions.js';
import { getActivityLogs } from './get-activity-logs.js';
import { getAWebhook } from './get-a-webhook.js';
import { getCommentsInAFile } from './get-comments-in-a-file.js';
import { getComponent2 } from './get-component2.js';
import { getComponentSet } from './get-component-set.js';
import { getCurrentUser } from './get-current-user.js';
import { getDevResources } from './get-dev-resources.js';
import { getFileComponentSets } from './get-file-component-sets.js';
import { getFileComponents } from './get-file-components.js';
import { getFileJson } from './get-file-json.js';
import { getFileMetadata } from './get-file-metadata.js';
import { getFileNodes } from './get-file-nodes.js';
import { getFileStyles } from './get-file-styles.js';
import { getFilesInAProject } from './get-files-in-a-project.js';
import { getImageFills } from './get-image-fills.js';
import { getLibraryAnalyticsComponentActionData } from './get-library-analytics-component-action-data.js';
import { getLibraryAnalyticsComponentUsageData } from './get-library-analytics-component-usage-data.js';
import { getLibraryAnalyticsStyleActionData } from './get-library-analytics-style-action-data.js';
import { getLibraryAnalyticsStyleUsageData } from './get-library-analytics-style-usage-data.js';
import { getLibraryAnalyticsVariableActionData } from './get-library-analytics-variable-action-data.js';
import { getLibraryAnalyticsVariableUsageData } from './get-library-analytics-variable-usage-data.js';
import { getLocalVariables } from './get-local-variables.js';
import { getPayments } from './get-payments.js';
import { getProjectsInATeam } from './get-projects-in-a-team.js';
import { getPublishedVariables } from './get-published-variables.js';
import { getReactionsForAComment } from './get-reactions-for-a-comment.js';
import { getScimServiceProviderConfig } from './get-scim-service-provider-config.js';
import { getStyle } from './get-style.js';
import { getTeamComponentSets } from './get-team-component-sets.js';
import { getTeamComponents } from './get-team-components.js';
import { getTeamStyles } from './get-team-styles.js';
import { getTeamWebhooks } from './get-team-webhooks.js';
import { getVersionsOfAFile } from './get-versions-of-a-file.js';
import { getWebhookRequests } from './get-webhook-requests.js';
import { renderImagesOfFileNodes } from './render-images-of-file-nodes.js';
import { updateAWebhook } from './update-a-webhook.js';
import { updateDevResources } from './update-dev-resources.js';

export {
    addCommentToAFile,
    addReactionToAComment,
    createAWebhook,
    createDevResources,
    createModifyDeleteVariables,
    deleteAComment,
    deleteAReaction,
    deleteAWebhook,
    deleteDevResource,
    designTokensToTailwind,
    detectBackground,
    discoverFigmaResources,
    downloadFigmaImages,
    extractDesignTokens,
    extractPrototypeInteractions,
    getActivityLogs,
    getAWebhook,
    getCommentsInAFile,
    getComponent2,
    getComponentSet,
    getCurrentUser,
    getDevResources,
    getFileComponentSets,
    getFileComponents,
    getFileJson,
    getFileMetadata,
    getFileNodes,
    getFileStyles,
    getFilesInAProject,
    getImageFills,
    getLibraryAnalyticsComponentActionData,
    getLibraryAnalyticsComponentUsageData,
    getLibraryAnalyticsStyleActionData,
    getLibraryAnalyticsStyleUsageData,
    getLibraryAnalyticsVariableActionData,
    getLibraryAnalyticsVariableUsageData,
    getLocalVariables,
    getPayments,
    getProjectsInATeam,
    getPublishedVariables,
    getReactionsForAComment,
    getScimServiceProviderConfig,
    getStyle,
    getTeamComponentSets,
    getTeamComponents,
    getTeamStyles,
    getTeamWebhooks,
    getVersionsOfAFile,
    getWebhookRequests,
    renderImagesOfFileNodes,
    updateAWebhook,
    updateDevResources,
};

const auth = 'figmaToken' as const;

export const figmaTools = [
    { name: 'figmaAddCommentToAFile', description: 'Posts a comment to a file or branch, optionally replying to a root comment.', tool: addCommentToAFile, requiredAuth: auth, scope: 'write' as const },
    { name: 'figmaAddReactionToAComment', description: 'Posts an emoji reaction to a comment.', tool: addReactionToAComment, requiredAuth: auth, scope: 'write' as const },
    { name: 'figmaCreateAWebhook', description: 'Creates a team/project/file webhook for Figma events.', tool: createAWebhook, requiredAuth: auth, scope: 'write' as const },
    { name: 'figmaCreateDevResources', description: 'Attaches dev resources (Jira, GitHub, docs) to file nodes.', tool: createDevResources, requiredAuth: auth, scope: 'write' as const },
    { name: 'figmaCreateModifyDeleteVariables', description: 'Batch creates, updates, or deletes variables, collections, modes, and values.', tool: createModifyDeleteVariables, requiredAuth: auth, scope: 'write' as const },
    { name: 'figmaDeleteAComment', description: 'Deletes your comment from a file or branch.', tool: deleteAComment, requiredAuth: auth, scope: 'delete' as const },
    { name: 'figmaDeleteAReaction', description: 'Removes your emoji reaction from a comment.', tool: deleteAReaction, requiredAuth: auth, scope: 'delete' as const },
    { name: 'figmaDeleteAWebhook', description: 'Permanently deletes a webhook. Irreversible.', tool: deleteAWebhook, requiredAuth: auth, scope: 'delete' as const },
    { name: 'figmaDeleteDevResource', description: 'Deletes a dev resource from a main file.', tool: deleteDevResource, requiredAuth: auth, scope: 'delete' as const },
    { name: 'figmaDesignTokensToTailwind', description: 'Converts extracted design tokens into a Tailwind config plus font CSS. No auth needed.', tool: designTokensToTailwind, scope: 'read' as const },
    { name: 'figmaDetectBackground', description: 'Finds background candidates behind target nodes with confidence scores.', tool: detectBackground, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaDiscoverFigmaResources', description: 'Extracts IDs from any Figma URL and traverses team → projects → files → nodes.', tool: discoverFigmaResources, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaDownloadFigmaImages', description: 'Renders nodes and downloads image bytes (base64) in PNG/SVG/JPG/PDF.', tool: downloadFigmaImages, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaExtractDesignTokens', description: 'Extracts colors, typography, spacing, radii, and shadows from a file.', tool: extractDesignTokens, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaExtractPrototypeInteractions', description: 'Extracts prototype flows, interactions, animations, and variant states.', tool: extractPrototypeInteractions, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetActivityLogs', description: 'Retrieves org activity log events with filters and pagination.', tool: getActivityLogs, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetAWebhook', description: 'Retrieves a webhook by ID.', tool: getAWebhook, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetCommentsInAFile', description: 'Retrieves all comments from a file or branch.', tool: getCommentsInAFile, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetComponent2', description: 'Fetches published component metadata by component key.', tool: getComponent2, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetComponentSet', description: 'Fetches published component set metadata by set key.', tool: getComponentSet, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetCurrentUser', description: 'Returns the authenticated user details.', tool: getCurrentUser, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetDevResources', description: 'Lists dev resources on a main file, optionally filtered to nodes.', tool: getDevResources, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetFileComponentSets', description: 'Lists published component sets from a main library file.', tool: getFileComponentSets, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetFileComponents', description: 'Lists published components from a main library file.', tool: getFileComponents, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetFileJson', description: 'Gets a Design file document tree, optionally scoped to nodes and depth.', tool: getFileJson, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetFileMetadata', description: 'Gets file overview without the document tree.', tool: getFileMetadata, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetFileNodes', description: 'Fetches JSON for known node IDs without full-file payloads.', tool: getFileNodes, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetFileStyles', description: 'Lists published styles from a main library file.', tool: getFileStyles, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetFilesInAProject', description: 'Lists files in a project, optionally with branch metadata.', tool: getFilesInAProject, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetImageFills', description: 'Returns temporary download URLs for all image fills in a file.', tool: getImageFills, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetLibraryAnalyticsComponentActionData', description: 'Weekly component insertions/detachments for a library.', tool: getLibraryAnalyticsComponentActionData, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetLibraryAnalyticsComponentUsageData', description: 'Component usage totals for a library.', tool: getLibraryAnalyticsComponentUsageData, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetLibraryAnalyticsStyleActionData', description: 'Weekly style insertions/detachments for a library.', tool: getLibraryAnalyticsStyleActionData, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetLibraryAnalyticsStyleUsageData', description: 'Style usage totals for a library.', tool: getLibraryAnalyticsStyleUsageData, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetLibraryAnalyticsVariableActionData', description: 'Weekly variable insertions/detachments for a library.', tool: getLibraryAnalyticsVariableActionData, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetLibraryAnalyticsVariableUsageData', description: 'Variable usage totals for a library.', tool: getLibraryAnalyticsVariableUsageData, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetLocalVariables', description: 'Gets all local/remote variables with mode-specific values.', tool: getLocalVariables, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetPayments', description: 'Checks a user payment status for your plugin, widget, or Community file.', tool: getPayments, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetProjectsInATeam', description: 'Lists projects in a team.', tool: getProjectsInATeam, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetPublishedVariables', description: 'Gets published variables from a main library file.', tool: getPublishedVariables, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetReactionsForAComment', description: 'Lists reactions on a comment with pagination.', tool: getReactionsForAComment, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetScimServiceProviderConfig', description: 'Returns SCIM capabilities for account provisioning.', tool: getScimServiceProviderConfig, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetStyle', description: 'Fetches published style metadata by style key.', tool: getStyle, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetTeamComponentSets', description: 'Lists published component sets in a team library.', tool: getTeamComponentSets, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetTeamComponents', description: 'Lists published components in a team library.', tool: getTeamComponents, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetTeamStyles', description: 'Lists published styles in a team library.', tool: getTeamStyles, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetTeamWebhooks', description: 'Lists webhooks for a team, project, or file context.', tool: getTeamWebhooks, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetVersionsOfAFile', description: 'Retrieves version history for a file or branch.', tool: getVersionsOfAFile, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaGetWebhookRequests', description: 'Shows 7-day delivery history for a webhook.', tool: getWebhookRequests, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaRenderImagesOfFileNodes', description: 'Renders nodes as images and returns temporary URLs.', tool: renderImagesOfFileNodes, requiredAuth: auth, scope: 'read' as const },
    { name: 'figmaUpdateAWebhook', description: 'Updates a webhook event type, endpoint, passcode, status, or description.', tool: updateAWebhook, requiredAuth: auth, scope: 'write' as const },
    { name: 'figmaUpdateDevResources', description: 'Updates dev resource names and URLs by ID.', tool: updateDevResources, requiredAuth: auth, scope: 'write' as const },
];
