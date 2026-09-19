// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { slackApi, toSlackError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const slackSearchAll = tool({
    description:
        'Unified workspace search across messages and files in one call. Read the files section explicitly for document hits. Results are index-based (minutes stale); use history tools for real-time. Honor Retry-After on 429.',
    inputSchema: z.object({
        slackToken: tokenField,
        query: z.string().describe('Query with Slack modifiers, e.g. "error report in:#channel from:@user has:file"'),
        sort: z.string().optional().describe('score (relevance) or timestamp'),
        sortDir: z.string().optional().describe('asc or desc'),
        count: z.number().optional().describe('Results per page (default 20, max 100)'),
        page: z.number().optional().describe('Page number (default 1)'),
        highlight: z.boolean().optional().describe('Wrap search terms with highlight markers'),
        teamId: z.string().optional().describe('Workspace ID (org-level tokens only)'),
    }),
    execute: async ({ slackToken, sortDir, teamId, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'search.all', {
                ...rest,
                sort_dir: sortDir,
                team_id: teamId,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to search');
        }
    },
});

export const slackSearchMessages = tool({
    description:
        'Workspace-wide message search with query modifiers (in:#channel, from:@user, before:/after:/on: dates), sorting, and pagination. Combine with autoPaginate+count for full collection.',
    inputSchema: z.object({
        slackToken: tokenField,
        query: z.string().describe('Search query, e.g. "bug report from:@jane in:#support after:2025-01-01"'),
        sort: z.string().optional().describe('score or timestamp'),
        sortDir: z.string().optional().describe('asc or desc'),
        count: z.number().optional().describe('Per page (max 100), or total desired with autoPaginate'),
        page: z.number().optional().describe('Manual page number (not with cursor/autoPaginate)'),
        cursor: z.string().optional().describe('Cursor pagination ("*" for first call; preferred over page)'),
        highlight: z.boolean().optional().describe('Highlight search terms in results'),
        autoPaginate: z.boolean().optional().describe('Auto-collect pages until count total messages is reached'),
        teamId: z.string().optional().describe('Workspace ID (org-level tokens only)'),
    }),
    execute: async ({ slackToken, sortDir, autoPaginate, teamId, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            if (autoPaginate) {
                const total = rest.count ?? 100;
                const collected: any[] = [];
                let cursor: string | undefined = rest.cursor;
                let query = rest.query;
                while (collected.length < total) {
                    const data = await slackApi(slackToken, 'search.messages', {
                        query,
                        sort: rest.sort,
                        sort_dir: sortDir,
                        count: Math.min(100, total - collected.length),
                        cursor,
                        highlight: rest.highlight,
                        team_id: teamId,
                    });
                    const matches = data?.messages?.matches ?? [];
                    collected.push(...matches);
                    cursor = data?.messages?.paging?.next_cursor || data?.response_metadata?.next_cursor;
                    if (!cursor || matches.length === 0) break;
                }
                return { ok: true, query, messages: { total: collected.length, matches: collected.slice(0, total) } };
            }
            return await slackApi(slackToken, 'search.messages', {
                ...rest,
                sort_dir: sortDir,
                team_id: teamId,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to search messages');
        }
    },
});

export const slackAssistantSearch = tool({
    description:
        'Real-time search across messages, files, channels, and users (keyword or natural-language/semantic). Resolve named entities to IDs first via contentTypes; confirm with the user on multiple matches.',
    inputSchema: z.object({
        slackToken: tokenField,
        query: z.string().describe('Keyword or natural-language question'),
        contentTypes: z.string().optional().describe('Comma-separated: messages,files,channels,users (default messages)'),
        channelTypes: z.string().optional().describe('Comma-separated: public_channel,private_channel,mpim,im'),
        limit: z.number().min(1).max(20).optional().describe('Results per page (max 20, default 20)'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
        sort: z.string().optional().describe('score or timestamp'),
        sortDir: z.string().optional().describe('asc or desc'),
        before: z.number().optional().describe('Unix timestamp: only results before this date'),
        after: z.number().optional().describe('Unix timestamp: only results after this date'),
        modifiers: z.string().optional().describe("Extra filters, e.g. 'has:pin before:yesterday is:thread'"),
        termClauses: z.array(z.string()).optional().describe('Conjunctive search term clauses (all must match)'),
        highlight: z.boolean().optional().describe('Highlight matching terms'),
        includeBots: z.boolean().optional().describe('Include bot messages'),
        includeDeletedUsers: z.boolean().optional().describe('Include deleted users'),
        includeMessageBlocks: z.boolean().optional().describe('Return Block Kit blocks'),
        includeContextMessages: z.boolean().optional().describe('Include surrounding messages'),
        includeArchivedChannels: z.boolean().optional().describe('Include archived channels'),
        disableSemanticSearch: z.boolean().optional().describe('Force keyword-only search (no Slack AI)'),
        contextChannelId: z.string().optional().describe('Channel context hint (not a strict filter)'),
        actionToken: z.string().optional().describe('Event action token (required for bot tokens)'),
    }),
    execute: async ({ slackToken, contentTypes, channelTypes, sortDir, termClauses, includeBots, includeDeletedUsers, includeMessageBlocks, includeContextMessages, includeArchivedChannels, disableSemanticSearch, contextChannelId, actionToken, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'assistant.search.context', {
                ...rest,
                content_types: contentTypes,
                channel_types: channelTypes,
                sort_dir: sortDir,
                term_clauses: termClauses,
                include_bots: includeBots,
                include_deleted_users: includeDeletedUsers,
                include_message_blocks: includeMessageBlocks,
                include_context_messages: includeContextMessages,
                include_archived_channels: includeArchivedChannels,
                disable_semantic_search: disableSemanticSearch,
                context_channel_id: contextChannelId,
                action_token: actionToken,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to search');
        }
    },
});

export const slackGetSearchInfo = tool({
    description:
        'Check whether AI-powered semantic search is enabled on the workspace. When false, pass disableSemanticSearch=true to slackAssistantSearch for keyword-only search.',
    inputSchema: z.object({
        slackToken: tokenField,
    }),
    execute: async ({ slackToken }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'assistant.search.info', {});
        } catch (error) {
            return toSlackError(error, 'Failed to get search info');
        }
    },
});
