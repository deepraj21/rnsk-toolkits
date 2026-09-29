// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cuDelete, cuGet, cuPatch, cuPost, cuPut, cuUpload, nest } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const clickupCreateChatChannel = tool({
  description:
    'Tool to create a chat channel in a ClickUp workspace. Use when you need to set up a new communication channel for team collaboration with configurable visibility.',
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().describe('The name for the chat channel being created.'),
    topic: z.string().optional().describe('The topic of the chat channel being created.'),
    userIds: z
      .array(z.string())
      .optional()
      .describe('Optionally specify unique user IDs to add to the channel, up to 100.'),
    visibility: z
      .enum(['PUBLIC', 'PRIVATE'])
      .optional()
      .describe('Visibility level for the chat channel.'),
    description: z
      .string()
      .optional()
      .describe('The description for the chat channel being created.'),
    workspaceId: z
      .number()
      .int()
      .describe('The ID of the Workspace where the chat channel will be created.'),
  }),
  execute: async ({ clickupToken, name, topic, userIds, visibility, description, workspaceId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(clickupToken, V3, `/workspaces/${workspaceId}/chat/channels`, {
      body: nest({
        name: name,
        topic: topic,
        user_ids: userIds,
        visibility: visibility,
        description: description,
      }),
    });
  },
});

export const clickupCreateChatMessage = tool({
  description:
    'Tool to send a message in a ClickUp chat channel. Use when you need to post messages to team chat channels. Supports both regular messages and structured posts with optional assignments, followers, and reactions.',
  inputSchema: z.object({
    clickupToken: tokenField,
    type: z
      .enum(['message', 'post'])
      .describe(
        "The type of message: 'message' for regular text messages, 'post' for structured posts.",
      ),
    content: z
      .string()
      .describe('The full content of the message to be created. Supports markdown formatting.'),
    assignee: z
      .string()
      .optional()
      .describe('The user ID of the person to assign this message to.'),
    followers: z
      .array(z.string())
      .optional()
      .describe('List of user IDs to follow this message (max 10).'),
    postData: z.record(z.any()).optional().describe('Data for post-type messages.'),
    reactions: z
      .array(z.record(z.any()))
      .optional()
      .describe('Reactions to add to the message at creation time (max 10).'),
    channelId: z.string().describe('The ID of the Channel where the message will be sent.'),
    workspaceId: z.number().int().describe('The ID of the Workspace.'),
    contentFormat: z
      .enum(['text/md', 'text/plain'])
      .optional()
      .describe('Format of the message content.'),
    groupAssignee: z.string().optional().describe('The group ID to assign this message to.'),
    triagedAction: z
      .number()
      .int()
      .optional()
      .describe('The triaged action applied to the message: 1 or 2.'),
    triagedObjectId: z.string().optional().describe('The message triaged action object ID.'),
    triagedObjectType: z
      .number()
      .int()
      .optional()
      .describe('The message triaged action object type.'),
  }),
  execute: async ({
    clickupToken,
    type,
    content,
    assignee,
    followers,
    postData,
    reactions,
    channelId,
    workspaceId,
    contentFormat,
    groupAssignee,
    triagedAction,
    triagedObjectId,
    triagedObjectType,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(
      clickupToken,
      V3,
      `/workspaces/${workspaceId}/chat/channels/${channelId}/messages`,
      {
        body: nest({
          type: type,
          content: content,
          assignee: assignee,
          followers: followers,
          post_data: postData,
          reactions: reactions,
          group_assignee: groupAssignee,
          triaged_action: triagedAction,
          triaged_object_id: triagedObjectId,
          triaged_object_type: triagedObjectType,
        }),
        query: { content_format: contentFormat },
      },
    );
  },
});

export const clickupCreateChatReaction = tool({
  description:
    'Tool to add a reaction to a ClickUp chat message. Use when you need to react to a message with an emoji.',
  inputSchema: z.object({
    clickupToken: tokenField,
    reaction: z
      .string()
      .describe(
        "The emoji reaction to add, in shortcode format (e.g., '+1', '-1', 'thumbsup', 'heart', 'smile'). Use GitHub-style shortcodes without colons.",
      ),
    messageId: z.string().describe('The ID of the chat message to react to.'),
    workspaceId: z.number().int().describe('The ID of the Workspace containing the chat message.'),
  }),
  execute: async ({ clickupToken, reaction, messageId, workspaceId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(
      clickupToken,
      V3,
      `/workspaces/${workspaceId}/chat/messages/${messageId}/reactions`,
      { body: nest({ reaction: reaction }) },
    );
  },
});

export const clickupCreateDirectMessageChannel = tool({
  description:
    'Tool to create a direct message channel in ClickUp. Use when you need to start a direct message conversation with up to 15 users. A Self DM is created when no user IDs are provided.',
  inputSchema: z.object({
    clickupToken: tokenField,
    userIds: z
      .array(z.string())
      .optional()
      .describe(
        'The unique user IDs of participants in the direct message chat, up to 15. A Self DM is created when no user IDs are provided.',
      ),
    workspaceId: z
      .number()
      .int()
      .describe('The ID of the Workspace where the direct message channel will be created.'),
  }),
  execute: async ({ clickupToken, userIds, workspaceId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(clickupToken, V3, `/workspaces/${workspaceId}/chat/channels/direct_message`, {
      body: nest({ user_ids: userIds }),
    });
  },
});

export const clickupCreateLocationChatChannel = tool({
  description:
    'Tool to create a Channel on a Space, Folder, or List in ClickUp. Use when you need to create a location-based chat channel.',
  inputSchema: z.object({
    clickupToken: tokenField,
    topic: z.string().optional().describe('The topic/name of the chat channel being created.'),
    location: z
      .record(z.any())
      .describe('The location (space, folder, or list) where the channel will be created.'),
    userIds: z
      .array(z.string())
      .optional()
      .describe('Optionally specify unique user IDs to add to the channel, up to 100.'),
    visibility: z
      .enum(['PUBLIC', 'PRIVATE'])
      .optional()
      .describe('Visibility setting for the chat channel.'),
    description: z
      .string()
      .optional()
      .describe('The description for the chat channel being created.'),
    workspaceId: z.string().describe('The ID of the Workspace where the channel will be created.'),
  }),
  execute: async ({
    clickupToken,
    topic,
    location,
    userIds,
    visibility,
    description,
    workspaceId,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(clickupToken, V3, `/workspaces/${workspaceId}/chat/channels/location`, {
      body: nest({
        topic: topic,
        location: location,
        user_ids: userIds,
        visibility: visibility,
        description: description,
      }),
    });
  },
});

export const clickupCreateReplyMessage = tool({
  description:
    'Tool to create a reply to a chat message in ClickUp. Use when replying to an existing chat message. Requires workspace_id, message_id, type, and content.',
  inputSchema: z.object({
    clickupToken: tokenField,
    type: z.enum(['message', 'post']).describe('The type of message.'),
    content: z.string().describe('The full content of the message to be created.'),
    assignee: z.string().optional().describe('The possible assignee of the message.'),
    followers: z.array(z.string()).optional().describe('The ids of the followers of the message.'),
    postData: z.record(z.any()).optional().describe('Data for post-type messages.'),
    reactions: z
      .array(z.record(z.any()))
      .optional()
      .describe('The reactions to the message that exist at creation time.'),
    messageId: z.string().describe('The ID of the specified message to reply to.'),
    workspaceId: z.number().int().describe('The ID of the Workspace.'),
    contentFormat: z
      .enum(['text/md', 'text/plain'])
      .optional()
      .describe('Format of the message content.'),
    groupAssignee: z.string().optional().describe('The possible group assignee of the message.'),
    triagedAction: z
      .number()
      .int()
      .optional()
      .describe('The triaged action applied to the message. 1 or 2.'),
    triagedObjectId: z.string().optional().describe('The message triaged action object id.'),
    triagedObjectType: z
      .number()
      .int()
      .optional()
      .describe('The message triaged action object type.'),
  }),
  execute: async ({
    clickupToken,
    type,
    content,
    assignee,
    followers,
    postData,
    reactions,
    messageId,
    workspaceId,
    contentFormat,
    groupAssignee,
    triagedAction,
    triagedObjectId,
    triagedObjectType,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(
      clickupToken,
      V3,
      `/workspaces/${workspaceId}/chat/messages/${messageId}/replies`,
      {
        body: nest({
          type: type,
          content: content,
          assignee: assignee,
          followers: followers,
          post_data: postData,
          reactions: reactions,
          group_assignee: groupAssignee,
          triaged_action: triagedAction,
          triaged_object_id: triagedObjectId,
          triaged_object_type: triagedObjectType,
        }),
        query: { content_format: contentFormat },
      },
    );
  },
});

export const clickupDeleteChatChannel = tool({
  description:
    'Tool to delete a chat channel in ClickUp. Use when you need to permanently remove a chat channel from a workspace.',
  inputSchema: z.object({
    clickupToken: tokenField,
    channelId: z.string().describe('The ID of the chat channel to delete.'),
    workspaceId: z.number().int().describe('The ID of the Workspace containing the chat channel.'),
  }),
  execute: async ({ clickupToken, channelId, workspaceId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuDelete(clickupToken, V3, `/workspaces/${workspaceId}/chat/channels/${channelId}`);
  },
});

export const clickupDeleteChatMessage = tool({
  description:
    'Tool to delete a chat message in ClickUp. Use when you need to permanently remove a specific message from a workspace chat.',
  inputSchema: z.object({
    clickupToken: tokenField,
    messageId: z.string().describe('The ID of the specified message.'),
    workspaceId: z.number().int().describe('The ID of the Workspace.'),
  }),
  execute: async ({ clickupToken, messageId, workspaceId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuDelete(clickupToken, V3, `/workspaces/${workspaceId}/chat/messages/${messageId}`);
  },
});

export const clickupDeleteChatReaction = tool({
  description:
    'Tool to delete a reaction from a chat message in ClickUp. Use when you need to remove an emoji reaction that was previously added to a chat message.',
  inputSchema: z.object({
    clickupToken: tokenField,
    reaction: z
      .string()
      .describe(
        "The name of the reaction emoji to remove from the message (e.g., 'heart', 'thumbsup', 'smile'). Use the exact emoji name as it appears in ClickUp.",
      ),
    messageId: z.string().describe('The ID of the chat message from which to remove the reaction.'),
    workspaceId: z.string().describe('The ID of the Workspace containing the chat message.'),
  }),
  execute: async ({ clickupToken, reaction, messageId, workspaceId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuDelete(
      clickupToken,
      V3,
      `/workspaces/${workspaceId}/chat/messages/${messageId}/reactions`,
      { query: { reaction: reaction } },
    );
  },
});

export const clickupGetChatChannel = tool({
  description:
    'Retrieves details for a specific chat channel in a ClickUp Workspace. Use when you need information about a particular chat channel.',
  inputSchema: z.object({
    clickupToken: tokenField,
    channelId: z.string().describe('The ID of the specified Channel.'),
    workspaceId: z.number().int().describe('The ID of the Workspace.'),
    descriptionFormat: z
      .enum(['text/md', 'text/plain'])
      .optional()
      .describe('Format options for the channel description.'),
  }),
  execute: async ({ clickupToken, channelId, workspaceId, descriptionFormat }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V3, `/workspaces/${workspaceId}/chat/channels/${channelId}`, {
      query: { description_format: descriptionFormat },
    });
  },
});

export const clickupGetChatChannelFollowers = tool({
  description:
    'Tool to retrieve followers of a ClickUp chat channel. Use when you need to list users following a specific channel in a workspace.',
  inputSchema: z.object({
    clickupToken: tokenField,
    limit: z
      .number()
      .int()
      .optional()
      .describe('The maximum number of results to fetch for this page. Default is 50, max is 100.'),
    cursor: z
      .string()
      .optional()
      .describe(
        'The cursor to use to fetch the next page of results. Use the next_cursor value from the previous response.',
      ),
    channelId: z
      .string()
      .describe("The ID of the chat channel. Format example: '4-90165816748-8'."),
    workspaceId: z.number().int().describe('The ID of the Workspace containing the chat channel.'),
  }),
  execute: async ({ clickupToken, limit, cursor, channelId, workspaceId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(
      clickupToken,
      V3,
      `/workspaces/${workspaceId}/chat/channels/${channelId}/followers`,
      { query: { limit: limit, cursor: cursor } },
    );
  },
});

export const clickupGetChatChannelMembers = tool({
  description:
    'Tool to get members of a chat channel. Use when you need to retrieve the list of members in a specific ClickUp chat channel.',
  inputSchema: z.object({
    clickupToken: tokenField,
    limit: z
      .number()
      .int()
      .optional()
      .describe('The maximum number of results to fetch for this page. Default is 50, max is 100.'),
    cursor: z.string().optional().describe('The cursor to use to fetch the next page of results.'),
    channelId: z.string().describe('The ID of the specified Channel.'),
    workspaceId: z.number().int().describe('The ID of the Workspace.'),
  }),
  execute: async ({ clickupToken, limit, cursor, channelId, workspaceId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(
      clickupToken,
      V3,
      `/workspaces/${workspaceId}/chat/channels/${channelId}/members`,
      { query: { limit: limit, cursor: cursor } },
    );
  },
});

export const clickupGetChatChannels = tool({
  description:
    'Tool to retrieve chat channels in a ClickUp workspace. Use when you need to list available chat channels, DMs, or group chats in a workspace. Supports pagination via cursor and filtering by follower status, closed channels, and recent activity.',
  inputSchema: z.object({
    clickupToken: tokenField,
    limit: z
      .number()
      .int()
      .optional()
      .describe('The maximum number of results to fetch for this page.'),
    cursor: z.string().optional().describe('Used to request the next page of results.'),
    isFollower: z.boolean().optional().describe('Only return Channels the user is following.'),
    workspaceId: z.number().int().describe('The ID of the Workspace.'),
    channelTypes: z
      .string()
      .optional()
      .describe('Specify the types of Channels to return from the request.'),
    includeClosed: z
      .boolean()
      .optional()
      .describe('Include DMs/Group DMs that have been explicitly closed.'),
    descriptionFormat: z
      .enum(['text/md', 'text/plain'])
      .optional()
      .describe('Format options for channel descriptions.'),
    withMessageSince: z
      .number()
      .int()
      .optional()
      .describe(
        'Only return Channels with at least one message since the given timestamp (Unix milliseconds).',
      ),
  }),
  execute: async ({
    clickupToken,
    limit,
    cursor,
    isFollower,
    workspaceId,
    channelTypes,
    includeClosed,
    descriptionFormat,
    withMessageSince,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V3, `/workspaces/${workspaceId}/chat/channels`, {
      query: {
        limit: limit,
        cursor: cursor,
        is_follower: isFollower,
        channel_types: channelTypes,
        include_closed: includeClosed,
        description_format: descriptionFormat,
        with_message_since: withMessageSince,
      },
    });
  },
});

export const clickupGetChatMessageReactions = tool({
  description:
    'Tool to retrieve reactions on a ClickUp chat message. Use when you need to see who reacted to a message and with what emoji.',
  inputSchema: z.object({
    clickupToken: tokenField,
    limit: z
      .number()
      .int()
      .optional()
      .describe('The maximum number of results to fetch for this page. Defaults to 50.'),
    cursor: z
      .string()
      .optional()
      .describe(
        'The cursor to use to fetch the next page of results. Use the `next_cursor` from the previous response to paginate through reactions.',
      ),
    messageId: z.string().describe('The ID of the specified chat message.'),
    workspaceId: z.number().int().describe('The ID of the Workspace containing the chat message.'),
  }),
  execute: async ({ clickupToken, limit, cursor, messageId, workspaceId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(
      clickupToken,
      V3,
      `/workspaces/${workspaceId}/chat/messages/${messageId}/reactions`,
      { query: { limit: limit, cursor: cursor } },
    );
  },
});

export const clickupGetChatMessageReplies = tool({
  description:
    'Retrieves replies to a chat message in ClickUp. Use when you need to fetch responses to a specific message in a workspace chat.',
  inputSchema: z.object({
    clickupToken: tokenField,
    limit: z
      .number()
      .int()
      .optional()
      .describe('The maximum number of results to fetch for this page.'),
    cursor: z.string().optional().describe('The cursor to use to fetch the next page of results.'),
    messageId: z.string().describe('The ID of the specified message.'),
    workspaceId: z.number().int().describe('The ID of the Workspace.'),
    contentFormat: z
      .enum(['text/md', 'text/plain'])
      .optional()
      .describe('Content format for message replies.'),
  }),
  execute: async ({ clickupToken, limit, cursor, messageId, workspaceId, contentFormat }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(
      clickupToken,
      V3,
      `/workspaces/${workspaceId}/chat/messages/${messageId}/replies`,
      { query: { limit: limit, cursor: cursor, content_format: contentFormat } },
    );
  },
});

export const clickupGetChatMessages = tool({
  description:
    'Tool to retrieve messages from a ClickUp chat channel. Use when you need to fetch chat messages for a specific channel within a workspace.',
  inputSchema: z.object({
    clickupToken: tokenField,
    limit: z
      .number()
      .int()
      .optional()
      .describe('The maximum number of results to fetch for this page.'),
    cursor: z.string().optional().describe('The cursor to use to fetch the next page of results.'),
    channelId: z.string().describe('The ID of the Channel where the messages live.'),
    workspaceId: z.number().int().describe('The ID of the Workspace.'),
    contentFormat: z
      .enum(['text/md', 'text/plain'])
      .optional()
      .describe('Format options for message content.'),
  }),
  execute: async ({ clickupToken, limit, cursor, channelId, workspaceId, contentFormat }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(
      clickupToken,
      V3,
      `/workspaces/${workspaceId}/chat/channels/${channelId}/messages`,
      { query: { limit: limit, cursor: cursor, content_format: contentFormat } },
    );
  },
});

export const clickupGetChatMessageTaggedUsers = tool({
  description:
    'Tool to retrieve users tagged in a ClickUp chat message. Use when you need to get a list of users mentioned in a specific chat message.',
  inputSchema: z.object({
    clickupToken: tokenField,
    limit: z
      .number()
      .int()
      .optional()
      .describe('The maximum number of results to fetch for this page.'),
    cursor: z.string().optional().describe('The cursor to use to fetch the next page of results.'),
    messageId: z.string().describe('The ID of the specified message.'),
    workspaceId: z.number().int().describe('The ID of the Workspace.'),
  }),
  execute: async ({ clickupToken, limit, cursor, messageId, workspaceId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(
      clickupToken,
      V3,
      `/workspaces/${workspaceId}/chat/messages/${messageId}/tagged_users`,
      { query: { limit: limit, cursor: cursor } },
    );
  },
});

export const clickupGetSubtypes = tool({
  description:
    'Tool to retrieve post subtype IDs (Announcement, Discussion, Idea, Update) for a ClickUp Workspace. Use when you need subtype IDs to send messages with type: post.',
  inputSchema: z.object({
    clickupToken: tokenField,
    commentType: z
      .enum(['post', 'ai', 'syncup', 'ai_via_brain'])
      .describe(
        "The type of comment to retrieve subtypes for. Use 'post' to get subtype IDs for Announcement, Discussion, Idea, and Update post types.",
      ),
    workspaceId: z
      .number()
      .int()
      .describe(
        "ID of the logged-in user's Workspace. Obtain this from the get_authorized_teams_workspaces action or similar workspace listing endpoints.",
      ),
  }),
  execute: async ({ clickupToken, commentType, workspaceId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V3, `/workspaces/${workspaceId}/comments/subtypes`, {
      query: { comment_type: commentType },
    });
  },
});

export const clickupUpdateChatChannel = tool({
  description:
    "Tool to update a ClickUp chat channel's properties including name, topic, description, visibility, and location. Use when you need to modify an existing chat channel's settings. The endpoint requires both workspace_id and channel_id.",
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().optional().describe('The updated name of the Chat channel.'),
    topic: z.string().optional().describe('The updated topic of the Chat channel.'),
    location: z.record(z.any()).optional().describe('Location information for the chat channel.'),
    channelId: z.string().describe('The ID of the specified Channel.'),
    visibility: z
      .enum(['PUBLIC', 'PRIVATE'])
      .optional()
      .describe('Visibility setting for chat channel.'),
    description: z.string().optional().describe('The updated description of the Chat channel.'),
    workspaceId: z.number().int().describe('The ID of the Workspace.'),
    contentFormat: z
      .enum(['text/md', 'text/plain'])
      .optional()
      .describe('Content format for channel messages.'),
  }),
  execute: async ({
    clickupToken,
    name,
    topic,
    location,
    channelId,
    visibility,
    description,
    workspaceId,
    contentFormat,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPut(clickupToken, V3, `/workspaces/${workspaceId}/chat/channels/${channelId}`, {
      body: nest({
        name: name,
        topic: topic,
        location: location,
        visibility: visibility,
        description: description,
      }),
      query: { content_format: contentFormat },
    });
  },
});

export const clickupUpdateChatMessage = tool({
  description:
    "Tool to update a ClickUp chat message's content, assignee, or resolved status via the v3 API. Use when you need to edit an existing chat message.",
  inputSchema: z.object({
    clickupToken: tokenField,
    content: z
      .string()
      .optional()
      .describe(
        'The full content of the message to be updated. Maximum 40,000 characters. If not provided, message content will not be changed.',
      ),
    assignee: z
      .string()
      .optional()
      .describe('The possible assignee of the message. User ID as string.'),
    resolved: z
      .boolean()
      .optional()
      .describe(
        'The resolved status of the message. Set to true to mark as resolved, false to mark as unresolved.',
      ),
    postData: z.record(z.any()).optional().describe('Post data subtype information.'),
    messageId: z.string().describe('The ID of the message to update.'),
    workspaceId: z
      .string()
      .describe('The ID of the Workspace containing the chat message. Numeric string.'),
    contentFormat: z
      .enum(['text/md', 'text/plain'])
      .optional()
      .describe('Content format enum for chat messages.'),
    groupAssignee: z
      .string()
      .optional()
      .describe('The possible group assignee of the message. Team/group ID as string.'),
  }),
  execute: async ({
    clickupToken,
    content,
    assignee,
    resolved,
    postData,
    messageId,
    workspaceId,
    contentFormat,
    groupAssignee,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPut(clickupToken, V3, `/workspaces/${workspaceId}/chat/messages/${messageId}`, {
      body: nest({
        content: content,
        assignee: assignee,
        resolved: resolved,
        post_data: postData,
        group_assignee: groupAssignee,
      }),
      query: { content_format: contentFormat },
    });
  },
});

export const clickupUpdateWorkspaceAcl = tool({
  description:
    'Updates privacy and access control list (ACL) permissions for a workspace object or location. Use this to make objects private/public or manage user/team permissions for spaces, folders, lists, tasks, and other ClickUp objects.',
  inputSchema: z.object({
    clickupToken: tokenField,
    entries: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        "The user or user group (Team) entries to give, remove, or edit permissions. Each entry must include 'kind' (user or user_group) and 'id'. Optionally include 'permission_level' to set specific permissions.",
      ),
    isPrivate: z
      .boolean()
      .optional()
      .describe('Set the privacy of the object or location. True for private, false for public.'),
    objectId: z.string().describe('The ID of the specific object to update ACL permissions for.'),
    objectType: z
      .enum([
        'attachment',
        'attachmentAccess',
        'approval',
        'banWorkspace',
        'checklist',
        'checklistItem',
        'checklistTemplateAccess',
        'comment',
        'commentsLastReadAt',
        'customField',
        'customFieldAccess',
        'customItem',
        'customPermissionLevel',
        'dashboard',
        'dashboardAccess',
        'doc',
        'docAccess',
        'folder',
        'folderDescendantsSet',
        'folderTemplateAccess',
        'form',
        'formulaValue',
        'foundationalJob',
        'goal',
        'goalAccess',
        'goalFolder',
        'goalFolderAccess',
        'hierarchy',
        'list',
        'listDescendantsSet',
        'listDescendantsPoints',
        'listDescendantsTimeEstimates',
        'listTemplateAccess',
        'notepad',
        'page',
        'pageAccess',
        'post',
        'reminder',
        'reminderAccess',
        'rolledUpFieldValue',
        'scheduledComment',
        'space',
        'spaceDescendantsSet',
        'spaceTemplateAccess',
        'task',
        'taskAccess',
        'taskHistory',
        'taskProperty',
        'taskTemplateAccess',
        'template',
        'user',
        'userAccess',
        'userGroup',
        'userHierarchy',
        'userPresence',
        'view',
        'viewAccess',
        'viewTemplateAccess',
        'whiteboard',
        'whiteboardAccess',
        'widget',
        'workspace',
        'workspaceDescendantsSet',
        'workscheduleWorkweekSchedule',
        'workscheduleScheduleExceptions',
      ])
      .describe('The type of object to update ACL permissions for.'),
    workspaceId: z.string().describe('The ID of the Workspace. Numeric string.'),
  }),
  execute: async ({ clickupToken, entries, isPrivate, objectId, objectType, workspaceId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPatch(clickupToken, V3, `/workspaces/${workspaceId}/${objectType}/${objectId}/acls`, {
      body: nest({ entries: entries, private: isPrivate }),
    });
  },
});
