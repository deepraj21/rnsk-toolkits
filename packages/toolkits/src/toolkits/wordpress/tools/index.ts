// @ts-nocheck
import { wordpressCreateDraftPost } from './create-draft-post.js';
import { wordpressDeleteDraftPost } from './delete-draft-post.js';
import { wordpressGetPost } from './get-post.js';
import { wordpressGetSiteOverview } from './get-site-overview.js';
import { wordpressListBloggingPrompts } from './list-blogging-prompts.js';
import { wordpressListCmsResources } from './list-cms-resources.js';
import { wordpressListContent } from './list-content.js';
import { wordpressListReaderSubscriptions } from './list-reader-subscriptions.js';
import { wordpressListSites } from './list-sites.js';
import { wordpressUpdateDraftPost } from './update-draft-post.js';

export {
  wordpressCreateDraftPost,
  wordpressDeleteDraftPost,
  wordpressGetPost,
  wordpressGetSiteOverview,
  wordpressListBloggingPrompts,
  wordpressListCmsResources,
  wordpressListContent,
  wordpressListReaderSubscriptions,
  wordpressListSites,
  wordpressUpdateDraftPost,
};

export const wordpressTools = [
  {
    name: 'wordpressCreateDraftPost',
    description: 'Create a non-public draft post on an authorized site. This tool never publishes content; use the returned post ID for review, update, and cleanup.',
    tool: wordpressCreateDraftPost,
    requiredAuth: 'wordpressToken' as const,
    scope: 'write' as const,
  },
  {
    name: 'wordpressDeleteDraftPost',
    description: 'Permanently delete an existing draft post after verifying it is still a draft. The tool refuses to delete published, scheduled, pending, or private posts.',
    tool: wordpressDeleteDraftPost,
    requiredAuth: 'wordpressToken' as const,
    scope: 'delete' as const,
  },
  {
    name: 'wordpressGetPost',
    description: 'Get one post by ID in editable context, including raw content and its current status.',
    tool: wordpressGetPost,
    requiredAuth: 'wordpressToken' as const,
    scope: 'read' as const,
  },
  {
    name: 'wordpressGetSiteOverview',
    description: 'Get concise identity, plan, capabilities, editable settings, and traffic summary for one authorized site.',
    tool: wordpressGetSiteOverview,
    requiredAuth: 'wordpressToken' as const,
    scope: 'read' as const,
  },
  {
    name: 'wordpressListBloggingPrompts',
    description: 'List WordPress.com writing prompts for a site, optionally filtered by date or text, with agent-controlled pagination.',
    tool: wordpressListBloggingPrompts,
    requiredAuth: 'wordpressToken' as const,
    scope: 'read' as const,
  },
  {
    name: 'wordpressListCmsResources',
    description: 'List categories, tags, comments, media, or users for an authorized site through one consistent paginated read tool.',
    tool: wordpressListCmsResources,
    requiredAuth: 'wordpressToken' as const,
    scope: 'read' as const,
  },
  {
    name: 'wordpressListContent',
    description: 'List and search editable posts or pages on an authorized site, including drafts, with compact raw and rendered content fields and agent-controlled pagination.',
    tool: wordpressListContent,
    requiredAuth: 'wordpressToken' as const,
    scope: 'read' as const,
  },
  {
    name: 'wordpressListReaderSubscriptions',
    description: 'List feeds and sites followed by the connected WordPress.com account without changing subscriptions.',
    tool: wordpressListReaderSubscriptions,
    requiredAuth: 'wordpressToken' as const,
    scope: 'read' as const,
  },
  {
    name: 'wordpressListSites',
    description: 'List every WordPress.com or Jetpack-connected site authorized by the global OAuth account, returning stable numeric site IDs and concise capability and plan summaries for use with other tools.',
    tool: wordpressListSites,
    requiredAuth: 'wordpressToken' as const,
    scope: 'read' as const,
  },
  {
    name: 'wordpressUpdateDraftPost',
    description: 'Update title, body, excerpt, taxonomy, featured media, or comment policy for an existing draft. Provide at least one field to update. The tool refuses to modify a post whose current status is not draft.',
    tool: wordpressUpdateDraftPost,
    requiredAuth: 'wordpressToken' as const,
    scope: 'write' as const,
  },
];
