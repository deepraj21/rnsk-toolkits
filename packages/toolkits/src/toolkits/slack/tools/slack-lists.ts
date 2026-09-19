// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { slackApi, toSlackError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

function toRichText(value: unknown) {
    if (typeof value === 'string') {
        return [
            {
                type: 'rich_text',
                elements: [{ type: 'rich_text_section', elements: [{ type: 'text', text: value }] }],
            },
        ];
    }
    return value;
}

export const slackCreateList = tool({
    description:
        'Create a Slack List with a name, optional rich-text description, typed columns, or by copying another List (with optional rows), or in to-do task mode. Returns the list_id. Requires a user token.',
    inputSchema: z.object({
        slackToken: tokenField,
        name: z.string().describe('List title, e.g. Sprint Tasks'),
        descriptionBlocks: z.union([z.string(), z.record(z.any()), z.array(z.record(z.any()))]).optional().describe('Description (plain string auto-wrapped to rich_text, or blocks)'),
        schema: z.array(z.record(z.any())).optional().describe('Column definitions (name, type, options)'),
        todoMode: z.boolean().optional().describe('Add built-in task-tracking columns'),
        copyFromListId: z.string().optional().describe('Copy column structure from this List ID'),
        includeCopiedListRecords: z.boolean().optional().describe('Also copy rows (requires copyFromListId)'),
    }),
    execute: async ({ slackToken, name, descriptionBlocks, schema, todoMode, copyFromListId, includeCopiedListRecords }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'slackLists.create', {
                name,
                description_blocks: descriptionBlocks,
                schema,
                todo_mode: todoMode,
                copy_from_list_id: copyFromListId,
                include_copied_list_records: includeCopiedListRecords,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to create Slack List');
        }
    },
});

export const slackCreateListItem = tool({
    description:
        'Add a row to a Slack List with initial cell values. Text cells accept plain strings (auto-wrapped to rich_text); selects take choice values like ["todo"]. Copy a row via duplicatedItemId or nest via parentItemId. Requires a user token.',
    inputSchema: z.object({
        slackToken: tokenField,
        listId: z.string().describe('List ID, e.g. F0123456789'),
        initialFields: z.array(z.record(z.any())).optional().describe('Cells: {column_id, text|select|user|date|number|checkbox,...}'),
        parentItemId: z.string().optional().describe('Create as a subtask of this row ID'),
        duplicatedItemId: z.string().optional().describe('Copy this existing row ID'),
    }),
    execute: async ({ slackToken, listId, initialFields, parentItemId, duplicatedItemId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            const fields = (initialFields ?? []).map((cell: any) => {
                if (cell && typeof cell.text === 'string' && !cell.rich_text) {
                    const { text, ...rest } = cell;
                    return { ...rest, rich_text: toRichText(text) };
                }
                return cell;
            });
            return await slackApi(slackToken, 'slackLists.items.create', {
                list_id: listId,
                initial_fields: fields.length ? fields : undefined,
                parent_item_id: parentItemId,
                duplicated_item_id: duplicatedItemId,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to create Slack List item');
        }
    },
});

export const slackGetListItem = tool({
    description:
        'Read one List row with column_id-keyed typed values and parent List metadata. Optionally include subscription status. Requires a user token.',
    inputSchema: z.object({
        slackToken: tokenField,
        listId: z.string().describe('List ID holding the row'),
        id: z.string().describe('Row ID, e.g. Rec0123456789'),
        includeIsSubscribed: z.boolean().optional().describe('Include whether the caller is subscribed to the row'),
    }),
    execute: async ({ slackToken, listId, id, includeIsSubscribed }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'slackLists.items.info', {
                list_id: listId,
                id,
                include_is_subscribed: includeIsSubscribed,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to get Slack List item');
        }
    },
});

export const slackListListItems = tool({
    description:
        'List rows in a Slack List. You must paginate on response_metadata.next_cursor until empty or rows are silently truncated. Set archived=true for archived rows. Requires a user token.',
    inputSchema: z.object({
        slackToken: tokenField,
        listId: z.string().describe('List ID to read rows from'),
        limit: z.number().optional().describe('Rows per page (e.g. 100)'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
        archived: z.boolean().optional().describe('List archived rows instead of active ones'),
    }),
    execute: async ({ slackToken, listId, limit, cursor, archived }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'slackLists.items.list', {
                list_id: listId,
                limit,
                cursor,
                archived,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to list Slack List items');
        }
    },
});

export const slackUpdateList = tool({
    description:
        'Edit a List name, description, or to-do mode. Identify the List by id (not list_id). Description strings are auto-wrapped to rich_text. Requires a user token.',
    inputSchema: z.object({
        slackToken: tokenField,
        id: z.string().describe('List ID, e.g. F0123456789'),
        name: z.string().optional().describe('New title (omit to keep)'),
        descriptionBlocks: z.union([z.string(), z.record(z.any()), z.array(z.record(z.any()))]).optional().describe('New description'),
        todoMode: z.boolean().optional().describe('Toggle to-do task mode'),
    }),
    execute: async ({ slackToken, id, name, descriptionBlocks, todoMode }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'slackLists.update', {
                id,
                name,
                description_blocks: descriptionBlocks,
                todo_mode: todoMode,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to update Slack List');
        }
    },
});

export const slackUpdateListItem = tool({
    description:
        'Update cells of EXISTING List rows (row_id must match ^Rec[A-Z0-9]{8,}$). Text cells accept plain strings; selects take choice values. To add rows use slackCreateListItem. Requires a user token.',
    inputSchema: z.object({
        slackToken: tokenField,
        listId: z.string().describe('List ID containing the rows'),
        cells: z.array(z.record(z.any())).describe('Cells: {row_id, column_id, text|select|user|date|number|checkbox,...}'),
    }),
    execute: async ({ slackToken, listId, cells }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            const normalized = (cells ?? []).map((cell: any) => {
                if (cell && typeof cell.text === 'string' && !cell.rich_text) {
                    const { text, ...rest } = cell;
                    return { ...rest, rich_text: toRichText(text) };
                }
                return cell;
            });
            return await slackApi(slackToken, 'slackLists.items.update', {
                list_id: listId,
                cells: normalized,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to update Slack List item');
        }
    },
});

export const slackDeleteListItem = tool({
    description:
        'Permanently delete one List row by List ID and row ID. Cannot be undone — confirm with the user first. Requires a user token.',
    inputSchema: z.object({
        slackToken: tokenField,
        listId: z.string().describe('List ID holding the row'),
        id: z.string().describe('Row ID, e.g. Rec0123456789'),
    }),
    execute: async ({ slackToken, listId, id }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'slackLists.items.delete', { list_id: listId, id });
        } catch (error) {
            return toSlackError(error, 'Failed to delete Slack List item');
        }
    },
});

export const slackDeleteListItems = tool({
    description:
        'Delete multiple List rows in one all-or-nothing call. On failure treat the whole batch as not deleted and retry it entirely. Requires a user token.',
    inputSchema: z.object({
        slackToken: tokenField,
        listId: z.string().describe('List ID to delete rows from'),
        ids: z.array(z.string()).describe('Row IDs, e.g. ["Rec0123456789","Rec9876543210"]'),
    }),
    execute: async ({ slackToken, listId, ids }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'slackLists.items.deleteMultiple', { list_id: listId, ids });
        } catch (error) {
            return toSlackError(error, 'Failed to delete Slack List items');
        }
    },
});

export const slackSetListAccess = tool({
    description:
        'Share a List with channels or users at read/write/owner level. Provide exactly one of channelIds or userIds (owner requires userIds). Requires a user token.',
    inputSchema: z.object({
        slackToken: tokenField,
        listId: z.string().describe('List ID to share'),
        accessLevel: z.string().describe("One of 'read', 'write', or 'owner' (owner is user-only)"),
        channelIds: z.array(z.string()).optional().describe('Channel IDs to share with'),
        userIds: z.array(z.string()).optional().describe('User IDs to share with'),
    }),
    execute: async ({ slackToken, listId, accessLevel, channelIds, userIds }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            if ((channelIds && userIds) || (!channelIds && !userIds)) {
                return { error: 'Provide exactly one of channelIds or userIds.' };
            }
            if (accessLevel === 'owner' && !userIds) {
                return { error: "The 'owner' level requires userIds (not channelIds)." };
            }
            return await slackApi(slackToken, 'slackLists.access.set', {
                list_id: listId,
                access_level: accessLevel,
                channel_ids: channelIds,
                user_ids: userIds,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to set Slack List access');
        }
    },
});

export const slackDeleteListAccess = tool({
    description:
        'Revoke List sharing for channels or users. Provide exactly one of channelIds or userIds. Requires a user token.',
    inputSchema: z.object({
        slackToken: tokenField,
        listId: z.string().describe('List ID to revoke access on'),
        channelIds: z.array(z.string()).optional().describe('Channel IDs to revoke'),
        userIds: z.array(z.string()).optional().describe('User IDs to revoke'),
    }),
    execute: async ({ slackToken, listId, channelIds, userIds }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            if ((channelIds && userIds) || (!channelIds && !userIds)) {
                return { error: 'Provide exactly one of channelIds or userIds.' };
            }
            return await slackApi(slackToken, 'slackLists.access.delete', {
                list_id: listId,
                channel_ids: channelIds,
                user_ids: userIds,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to delete Slack List access');
        }
    },
});
