// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { linkedInRequest, missingToken, toLinkedInError } from './client.js';

const authField = {
  linkedinToken: z.string().optional().describe('Injected by system; do not provide'),
};

const authorField = z
  .string()
  .regex(
    /^urn:li:(person|organization):[A-Za-z0-9_-]+$/,
    'Must be urn:li:person:{id} or urn:li:organization:{id}',
  )
  .describe("Author URN, e.g. 'urn:li:person:abc123' or 'urn:li:organization:123456'");

const visibilityField = z
  .enum(['PUBLIC', 'CONNECTIONS', 'LOGGED_IN', 'CONTAINER'])
  .optional()
  .describe("Who can see the post (default 'PUBLIC')");

const distributionField = z
  .object({
    feedDistribution: z.enum(['MAIN_FEED', 'NONE']).optional().describe('Feed placement'),
    targetEntities: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        'Targeting rules, each with degrees, geoLocations, industries, seniorities, jobFunctions, fieldsOfStudy, or organizations URN lists',
      ),
    thirdPartyDistributionChannels: z
      .array(z.string())
      .optional()
      .describe('External distribution channels'),
  })
  .optional()
  .describe('Distribution rules; defaults to MAIN_FEED with no targeting');

function defaultDistribution(distribution: any) {
  return {
    feedDistribution: 'MAIN_FEED',
    targetEntities: [],
    thirdPartyDistributionChannels: [],
    ...(distribution ?? {}),
  };
}

export const linkedinCreatePost = tool({
  description:
    'Create a text post on LinkedIn as the authenticated member or a managed organization. Use for status updates and announcements; attach previously uploaded images via imageUrns, reshare via reshareParentUrn, or add a call-to-action button.',
  inputSchema: z.object({
    ...authField,
    author: authorField,
    commentary: z
      .string()
      .min(1)
      .max(3000)
      .describe(
        'Main post text (max 3000 chars); supports @-mentions like @[Name](urn:li:person:xxxx)',
      ),
    visibility: visibilityField,
    distribution: distributionField,
    lifecycleState: z
      .enum(['PUBLISHED', 'DRAFT', 'PUBLISH_REQUESTED'])
      .optional()
      .describe("Post state (default 'PUBLISHED')"),
    imageUrns: z
      .array(z.string())
      .max(20)
      .optional()
      .describe(
        'Image URNs from linkedinInitializeImageUpload (1-20). One image posts as media, 2+ as a multi-image carousel',
      ),
    container: z
      .string()
      .optional()
      .describe("Container URN for group/event posts, e.g. 'urn:li:group:123456'"),
    reshareParentUrn: z
      .string()
      .optional()
      .describe('URN of the post being reshared (reshareContext.parent)'),
    contentLandingPage: z.string().optional().describe('URL opened by the call-to-action button'),
    contentCallToActionLabel: z
      .enum([
        'APPLY',
        'DOWNLOAD',
        'VIEW_QUOTE',
        'LEARN_MORE',
        'SIGN_UP',
        'SUBSCRIBE',
        'REGISTER',
        'JOIN',
        'ATTEND',
        'REQUEST_DEMO',
        'SEE_MORE',
        'BUY_NOW',
        'SHOP_NOW',
      ])
      .optional()
      .describe('Call-to-action button label'),
    isReshareDisabledByAuthor: z.boolean().optional().describe('Set true to block resharing'),
  }),
  execute: async ({
    linkedinToken,
    author,
    commentary,
    visibility,
    distribution,
    lifecycleState,
    imageUrns,
    container,
    reshareParentUrn,
    contentLandingPage,
    contentCallToActionLabel,
    isReshareDisabledByAuthor,
  }) => {
    try {
      if (!linkedinToken) return missingToken();
      const body: Record<string, unknown> = {
        author,
        commentary,
        visibility: visibility ?? 'PUBLIC',
        distribution: defaultDistribution(distribution),
        lifecycleState: lifecycleState ?? 'PUBLISHED',
        isReshareDisabledByAuthor: isReshareDisabledByAuthor ?? false,
      };
      if (imageUrns && imageUrns.length === 1) body.content = { media: { id: imageUrns[0] } };
      if (imageUrns && imageUrns.length > 1) {
        body.content = { multiImage: { images: imageUrns.map((id) => ({ id })) } };
      }
      if (container !== undefined) body.container = container;
      if (reshareParentUrn !== undefined) body.reshareContext = { parent: reshareParentUrn };
      if (contentLandingPage !== undefined) body.contentLandingPage = contentLandingPage;
      if (contentCallToActionLabel !== undefined)
        body.contentCallToActionLabel = contentCallToActionLabel;
      return await linkedInRequest(linkedinToken, '/rest/posts', { body });
    } catch (error) {
      return toLinkedInError(error, 'Failed to create LinkedIn post');
    }
  },
});

export const linkedinCreateArticleShare = tool({
  description:
    'Share a URL link on LinkedIn with optional commentary via the UGC Posts API. Use when posting an article or any link preview; the post shows the URL title, description, and thumbnail.',
  inputSchema: z.object({
    ...authField,
    author: authorField,
    url: z.string().describe('HTTP/HTTPS URL to share, e.g. https://blog.linkedin.com/'),
    commentary: z.string().optional().describe('Text accompanying the shared URL'),
    title: z.string().optional().describe('Custom title shown on the link preview'),
    description: z.string().optional().describe('Custom description shown on the link preview'),
    visibility: z
      .enum(['PUBLIC', 'CONNECTIONS', 'LOGGED_IN'])
      .optional()
      .describe("Who can see the share (default 'PUBLIC')"),
    lifecycleState: z
      .enum(['PUBLISHED', 'DRAFT'])
      .optional()
      .describe("Use 'PUBLISHED' to post immediately (default)"),
  }),
  execute: async ({
    linkedinToken,
    author,
    url,
    commentary,
    title,
    description,
    visibility,
    lifecycleState,
  }) => {
    try {
      if (!linkedinToken) return missingToken();
      return await linkedInRequest(linkedinToken, '/v2/ugcPosts', {
        body: {
          author,
          lifecycleState: lifecycleState ?? 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text: commentary ?? '' },
              shareMediaCategory: 'ARTICLE',
              media: [
                {
                  status: 'READY',
                  originalUrl: url,
                  ...(title !== undefined ? { title: { text: title } } : {}),
                  ...(description !== undefined ? { description: { text: description } } : {}),
                },
              ],
            },
          },
          visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': visibility ?? 'PUBLIC' },
        },
      });
    } catch (error) {
      return toLinkedInError(error, 'Failed to create article share');
    }
  },
});

export const linkedinCreateVideoPost = tool({
  description:
    'Publish an uploaded LinkedIn video as a personal native video post. Use after linkedinUploadVideo returns a ready video URN; pass it here with commentary.',
  inputSchema: z.object({
    ...authField,
    author: authorField,
    videoUrn: z.string().describe("Ready video URN, e.g. 'urn:li:video:C4E10AQGUkQY7trgh-Q'"),
    commentary: z.string().min(1).max(3000).describe('Text published with the video'),
    title: z.string().optional().describe('Title displayed with the video'),
    visibility: z
      .enum(['PUBLIC', 'CONNECTIONS', 'LOGGED_IN'])
      .optional()
      .describe("Who can see the post (default 'PUBLIC')"),
  }),
  execute: async ({ linkedinToken, author, videoUrn, commentary, title, visibility }) => {
    try {
      if (!linkedinToken) return missingToken();
      return await linkedInRequest(linkedinToken, '/rest/posts', {
        body: {
          author,
          commentary,
          visibility: visibility ?? 'PUBLIC',
          distribution: defaultDistribution(undefined),
          content: { video: { id: videoUrn, ...(title !== undefined ? { title } : {}) } },
          lifecycleState: 'PUBLISHED',
          isReshareDisabledByAuthor: false,
        },
      });
    } catch (error) {
      return toLinkedInError(error, 'Failed to create video post');
    }
  },
});

export const linkedinGetPostContent = tool({
  description:
    'Fetch full content and metadata of a LinkedIn post by URN: text, images, video, author, visibility, and lifecycle state. Use to inspect a post before replying, resharing, or deleting.',
  inputSchema: z.object({
    ...authField,
    postId: z
      .string()
      .describe(
        "Post URN, e.g. 'urn:li:ugcPost:7428263313739988992' or 'urn:li:share:7245341016004718592'",
      ),
  }),
  execute: async ({ linkedinToken, postId }) => {
    try {
      if (!linkedinToken) return missingToken();
      return await linkedInRequest(
        linkedinToken,
        `/rest/posts/${encodeURIComponent(postId.trim())}`,
      );
    } catch (error) {
      return toLinkedInError(error, 'Failed to get post content');
    }
  },
});

export const linkedinDeletePost = tool({
  description:
    'Delete a LinkedIn post via the Posts API by ugcPost or share URN. Idempotent: deleting an already-deleted post still returns success.',
  inputSchema: z.object({
    ...authField,
    postUrn: z
      .string()
      .describe("Post URN, e.g. 'urn:li:ugcPost:7890123456' or 'urn:li:share:7245341016004718592'"),
  }),
  execute: async ({ linkedinToken, postUrn }) => {
    try {
      if (!linkedinToken) return missingToken();
      try {
        await linkedInRequest(linkedinToken, `/rest/posts/${encodeURIComponent(postUrn.trim())}`, {
          method: 'DELETE',
        });
      } catch (error) {
        if ((error as any)?.status === 404) {
          return { success: true, message: `Post ${postUrn} already deleted.` };
        }
        throw error;
      }
      return { success: true, message: `Post ${postUrn} deleted.` };
    } catch (error) {
      return toLinkedInError(error, 'Failed to delete post');
    }
  },
});

export const linkedinDeleteShare = tool({
  description:
    'Delete a LinkedIn share by its numeric share ID (accepts a bare ID or full urn:li:share:{id} URN). Use when you only have the share ID rather than a full post URN.',
  inputSchema: z.object({
    ...authField,
    shareId: z
      .string()
      .describe("Share ID, e.g. '7245341016004718592' or 'urn:li:share:7245341016004718592'"),
  }),
  execute: async ({ linkedinToken, shareId }) => {
    try {
      if (!linkedinToken) return missingToken();
      const trimmed = shareId.trim();
      const id = trimmed.includes(':') ? trimmed.split(':').pop()! : trimmed;
      await linkedInRequest(linkedinToken, `/v2/shares/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return { success: true, message: `Share ${id} deleted.` };
    } catch (error) {
      return toLinkedInError(error, 'Failed to delete share');
    }
  },
});

export const linkedinDeleteUgcPost = tool({
  description:
    'Delete a UGC post via the legacy UGC Posts API by ugcPost or share URN. Idempotent: already-deleted posts return success.',
  inputSchema: z.object({
    ...authField,
    ugcPostUrn: z
      .string()
      .describe(
        "UGC post URN, e.g. 'urn:li:ugcPost:7890123456' or 'urn:li:share:7245341016004718592'",
      ),
  }),
  execute: async ({ linkedinToken, ugcPostUrn }) => {
    try {
      if (!linkedinToken) return missingToken();
      try {
        await linkedInRequest(
          linkedinToken,
          `/v2/ugcPosts/${encodeURIComponent(ugcPostUrn.trim())}`,
          {
            method: 'DELETE',
          },
        );
      } catch (error) {
        if ((error as any)?.status === 404) {
          return { success: true, message: `UGC post ${ugcPostUrn} already deleted.` };
        }
        throw error;
      }
      return { success: true, message: `UGC post ${ugcPostUrn} deleted.` };
    } catch (error) {
      return toLinkedInError(error, 'Failed to delete UGC post');
    }
  },
});
