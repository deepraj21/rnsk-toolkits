// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { asanaGet, asanaPost, optQuery, pageQuery } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const gid = (label: string) => z.string().describe(label);
const optFields = z.array(z.string()).optional().describe('Extra fields to include');
const optPretty = z.boolean().optional().describe('Pretty-print response (debugging only)');
const paging = {
  limit: z.number().int().min(1).max(100).optional().describe('Results per page'),
  offset: z.string().optional().describe('Pagination offset token'),
};

export const asanaGetPortfolios = tool({
  description: 'List portfolios in a workspace owned by a user.',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspace: z.string().describe('Workspace GID'),
    owner: z.string().describe('Owner user GID (or "me")'),
    ...paging,
    optFields,
  }),
  execute: ({ asanaToken, workspace, owner, limit, offset, optFields }) =>
    asanaGet(asanaToken, '/portfolios', {
      query: { workspace, owner, ...pageQuery(limit, offset), ...optQuery(optFields, undefined) },
    }),
});

export const asanaGetPortfolio = tool({
  description: 'Get a portfolio by GID with its members, dates, and custom fields.',
  inputSchema: z.object({
    asanaToken: tokenField,
    portfolioGid: gid('Portfolio GID'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, portfolioGid, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, `/portfolios/${portfolioGid}`, {
      query: { ...pageQuery(limit, offset), ...optQuery(optFields, optPretty) },
    }),
});

export const asanaGetPortfolioItems = tool({
  description: 'List projects and other items contained in a portfolio.',
  inputSchema: z.object({
    asanaToken: tokenField,
    portfolioGid: gid('Portfolio GID'),
    ...paging,
    optFields,
  }),
  execute: ({ asanaToken, portfolioGid, limit, offset, optFields }) =>
    asanaGet(asanaToken, `/portfolios/${portfolioGid}/items`, {
      query: { ...pageQuery(limit, offset), ...optQuery(optFields, undefined) },
    }),
});

export const asanaAddItemToPortfolio = tool({
  description: 'Add a project (or other item) to a portfolio, optionally at a position.',
  inputSchema: z.object({
    asanaToken: tokenField,
    portfolioGid: gid('Portfolio GID'),
    item: z.string().describe('Item GID to add (typically a project GID)'),
    insertAfter: z
      .string()
      .optional()
      .describe('Item GID to insert after (mutually exclusive with insertBefore)'),
    insertBefore: z
      .string()
      .optional()
      .describe('Item GID to insert before (mutually exclusive with insertAfter)'),
  }),
  execute: ({ asanaToken, portfolioGid, item, insertAfter, insertBefore }) =>
    asanaPost(asanaToken, `/portfolios/${portfolioGid}/addItem`, {
      body: { item, insert_after: insertAfter, insert_before: insertBefore },
    }),
});

export const asanaRemoveItemFromPortfolio = tool({
  description: 'Remove an item from a portfolio (the item itself is kept).',
  inputSchema: z.object({
    asanaToken: tokenField,
    portfolioGid: gid('Portfolio GID'),
    item: z.string().describe('Item GID to remove'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, portfolioGid, item, optFields, optPretty }) =>
    asanaPost(asanaToken, `/portfolios/${portfolioGid}/removeItem`, {
      body: { item },
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaGetPortfolioMemberships = tool({
  description: 'List portfolio memberships filtered by portfolio, user, or workspace.',
  inputSchema: z.object({
    asanaToken: tokenField,
    portfolio: z.string().optional().describe('Portfolio GID filter'),
    user: z.string().optional().describe('User GID filter'),
    workspace: z.string().optional().describe('Workspace GID filter'),
    ...paging,
    optFields,
  }),
  execute: ({ asanaToken, portfolio, user, workspace, limit, offset, optFields }) =>
    asanaGet(asanaToken, '/portfolio_memberships', {
      query: {
        portfolio,
        user,
        workspace,
        ...pageQuery(limit, offset),
        ...optQuery(optFields, undefined),
      },
    }),
});
