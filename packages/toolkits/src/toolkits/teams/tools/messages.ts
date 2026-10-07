// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { graphRequest, failedResult, toTeamsError } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const teamIdField = z.string().describe('Team (group) ID');
const channelIdField = z.string().describe('Channel ID');

const messageBodyField = z
  .object({
    contentType: z.enum(['text', 'html']).describe('Body format'),
    content: z.string().describe('Message content'),
  })
  .describe('Message body');

export const teamsListChannelMessages = tool({
  description: 'List top-level messages in a channel (no replies) with paging and reply expansion.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    channelId: channelIdField,
    top: z.number().int().min(1).max(50).optional().describe('Messages per page (max 50)'),
    expandReplies: z.boolean().optional().describe('Include replies inline'),
  }),
  execute: async ({ teamsToken, teamId, channelId, top, expandReplies }) => {
    try {
      const result = await graphRequest(
        teamsToken,
        `/teams/${teamId}/channels/${channelId}/messages`,
        { query: { $top: top, $expand: expandReplies === true ? 'replies' : undefined } },
      );
      if (!result.ok) return failedResult('Failed to list channel messages', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error listing channel messages');
    }
  },
});

export const teamsGetChannelMessage = tool({
  description: 'Get one channel message with body, mentions, and reactions.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    channelId: channelIdField,
    messageId: z.string().describe('Message ID'),
  }),
  execute: async ({ teamsToken, teamId, channelId, messageId }) => {
    try {
      const result = await graphRequest(
        teamsToken,
        `/teams/${teamId}/channels/${channelId}/messages/${messageId}`,
      );
      if (!result.ok) return failedResult('Failed to get channel message', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error getting channel message');
    }
  },
});

export const teamsSendChannelMessage = tool({
  description: 'Post a message to a channel (text or HTML, mentions, attachments).',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    channelId: channelIdField,
    body: messageBodyField,
    subject: z.string().optional().describe('Subject for post-layout announcements'),
    importance: z.enum(['normal', 'high', 'urgent']).optional().describe('Message importance'),
  }),
  execute: async ({ teamsToken, teamId, channelId, body, subject, importance }) => {
    try {
      const result = await graphRequest(
        teamsToken,
        `/teams/${teamId}/channels/${channelId}/messages`,
        {
          method: 'POST',
          body: {
            body,
            ...(subject !== undefined ? { subject } : {}),
            ...(importance !== undefined ? { importance } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to send channel message', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error sending channel message');
    }
  },
});

export const teamsReplyChannelMessage = tool({
  description: 'Reply in a thread to a channel message.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    channelId: channelIdField,
    messageId: z.string().describe('Parent message ID'),
    body: messageBodyField,
  }),
  execute: async ({ teamsToken, teamId, channelId, messageId, body }) => {
    try {
      const result = await graphRequest(
        teamsToken,
        `/teams/${teamId}/channels/${channelId}/messages/${messageId}/replies`,
        { method: 'POST', body: { body } },
      );
      if (!result.ok) return failedResult('Failed to reply to channel message', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error replying to channel message');
    }
  },
});

export const teamsListMessageReplies = tool({
  description: 'List replies to a channel message.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    channelId: channelIdField,
    messageId: z.string().describe('Parent message ID'),
    top: z.number().int().min(1).optional().describe('Replies per page'),
  }),
  execute: async ({ teamsToken, teamId, channelId, messageId, top }) => {
    try {
      const result = await graphRequest(
        teamsToken,
        `/teams/${teamId}/channels/${channelId}/messages/${messageId}/replies`,
        { query: { $top: top } },
      );
      if (!result.ok) return failedResult('Failed to list message replies', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error listing message replies');
    }
  },
});

export const teamsUpdateChannelMessage = tool({
  description: 'Edit a channel message body or subject.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    channelId: channelIdField,
    messageId: z.string().describe('Message ID'),
    body: messageBodyField,
    subject: z.string().optional().describe('New subject'),
  }),
  execute: async ({ teamsToken, teamId, channelId, messageId, body, subject }) => {
    try {
      const result = await graphRequest(
        teamsToken,
        `/teams/${teamId}/channels/${channelId}/messages/${messageId}`,
        {
          method: 'PATCH',
          body: { body, ...(subject !== undefined ? { subject } : {}) },
        },
      );
      if (!result.ok) return failedResult('Failed to update channel message', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error updating channel message');
    }
  },
});

export const teamsDeleteChannelMessage = tool({
  description: 'Soft-delete a channel message (recoverable via undo).',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    channelId: channelIdField,
    messageId: z.string().describe('Message ID'),
  }),
  execute: async ({ teamsToken, teamId, channelId, messageId }) => {
    try {
      const result = await graphRequest(
        teamsToken,
        `/teams/${teamId}/channels/${channelId}/messages/${messageId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete channel message', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toTeamsError(error, 'Error deleting channel message');
    }
  },
});

export const teamsUndoDeleteChannelMessage = tool({
  description: 'Restore a soft-deleted channel message.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    channelId: channelIdField,
    messageId: z.string().describe('Message ID'),
  }),
  execute: async ({ teamsToken, teamId, channelId, messageId }) => {
    try {
      const result = await graphRequest(
        teamsToken,
        `/teams/${teamId}/channels/${channelId}/messages/${messageId}/undoSoftDelete`,
        { method: 'POST' },
      );
      if (!result.ok) return failedResult('Failed to restore channel message', result);
      return result.data ?? { restored: true };
    } catch (error) {
      return toTeamsError(error, 'Error restoring channel message');
    }
  },
});

export const teamsListChats = tool({
  description: 'List 1:1, group, and meeting chats the user participates in.',
  inputSchema: z.object({
    teamsToken: tokenField,
    top: z.number().int().min(1).optional().describe('Chats per page'),
    filter: z.string().optional().describe("OData filter, e.g. chatType eq 'oneOnOne'"),
  }),
  execute: async ({ teamsToken, top, filter }) => {
    try {
      const result = await graphRequest(teamsToken, '/me/chats', {
        query: { $top: top, $filter: filter },
      });
      if (!result.ok) return failedResult('Failed to list chats', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error listing chats');
    }
  },
});

export const teamsGetChat = tool({
  description: 'Get one chat with type, topic, and meeting info.',
  inputSchema: z.object({
    teamsToken: tokenField,
    chatId: z.string().describe('Chat ID'),
  }),
  execute: async ({ teamsToken, chatId }) => {
    try {
      const result = await graphRequest(teamsToken, `/chats/${chatId}`);
      if (!result.ok) return failedResult('Failed to get chat', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error getting chat');
    }
  },
});

export const teamsCreateChat = tool({
  description: 'Start a 1:1 or group chat with members by user ID or UPN.',
  inputSchema: z.object({
    teamsToken: tokenField,
    chatType: z.enum(['oneOnOne', 'group']).describe('Chat type'),
    memberIds: z.array(z.string()).min(1).describe('Member user IDs or UPNs'),
    topic: z.string().optional().describe('Group chat topic'),
  }),
  execute: async ({ teamsToken, chatType, memberIds, topic }) => {
    try {
      const result = await graphRequest(teamsToken, '/me/chats', {
        method: 'POST',
        body: {
          chatType,
          members: memberIds.map((id) => ({
            '@odata.type': '#microsoft.graph.aadUserConversationMember',
            roles: ['owner'],
            'user@odata.bind': `https://graph.microsoft.com/v1.0/users('${id}')`,
          })),
          ...(topic !== undefined ? { topic } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create chat', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error creating chat');
    }
  },
});

export const teamsUpdateChat = tool({
  description: 'Update a group chat topic.',
  inputSchema: z.object({
    teamsToken: tokenField,
    chatId: z.string().describe('Chat ID'),
    topic: z.string().describe('New chat topic'),
  }),
  execute: async ({ teamsToken, chatId, topic }) => {
    try {
      const result = await graphRequest(teamsToken, `/chats/${chatId}`, {
        method: 'PATCH',
        body: { topic },
      });
      if (!result.ok) return failedResult('Failed to update chat', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error updating chat');
    }
  },
});

export const teamsDeleteChat = tool({
  description: 'Delete a chat for all participants.',
  inputSchema: z.object({
    teamsToken: tokenField,
    chatId: z.string().describe('Chat ID'),
  }),
  execute: async ({ teamsToken, chatId }) => {
    try {
      const result = await graphRequest(teamsToken, `/chats/${chatId}`, { method: 'DELETE' });
      if (!result.ok) return failedResult('Failed to delete chat', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toTeamsError(error, 'Error deleting chat');
    }
  },
});

export const teamsListChatMessages = tool({
  description: 'List messages in a chat with paging.',
  inputSchema: z.object({
    teamsToken: tokenField,
    chatId: z.string().describe('Chat ID'),
    top: z.number().int().min(1).optional().describe('Messages per page'),
  }),
  execute: async ({ teamsToken, chatId, top }) => {
    try {
      const result = await graphRequest(teamsToken, `/chats/${chatId}/messages`, {
        query: { $top: top },
      });
      if (!result.ok) return failedResult('Failed to list chat messages', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error listing chat messages');
    }
  },
});

export const teamsGetChatMessage = tool({
  description: 'Get one chat message.',
  inputSchema: z.object({
    teamsToken: tokenField,
    chatId: z.string().describe('Chat ID'),
    messageId: z.string().describe('Message ID'),
  }),
  execute: async ({ teamsToken, chatId, messageId }) => {
    try {
      const result = await graphRequest(teamsToken, `/chats/${chatId}/messages/${messageId}`);
      if (!result.ok) return failedResult('Failed to get chat message', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error getting chat message');
    }
  },
});

export const teamsSendChatMessage = tool({
  description: 'Send a message in a 1:1, group, or meeting chat.',
  inputSchema: z.object({
    teamsToken: tokenField,
    chatId: z.string().describe('Chat ID'),
    body: messageBodyField,
    importance: z.enum(['normal', 'high', 'urgent']).optional().describe('Message importance'),
  }),
  execute: async ({ teamsToken, chatId, body, importance }) => {
    try {
      const result = await graphRequest(teamsToken, `/chats/${chatId}/messages`, {
        method: 'POST',
        body: { body, ...(importance !== undefined ? { importance } : {}) },
      });
      if (!result.ok) return failedResult('Failed to send chat message', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error sending chat message');
    }
  },
});

export const teamsUpdateChatMessage = tool({
  description: 'Edit a chat message body.',
  inputSchema: z.object({
    teamsToken: tokenField,
    chatId: z.string().describe('Chat ID'),
    messageId: z.string().describe('Message ID'),
    body: messageBodyField,
  }),
  execute: async ({ teamsToken, chatId, messageId, body }) => {
    try {
      const result = await graphRequest(teamsToken, `/chats/${chatId}/messages/${messageId}`, {
        method: 'PATCH',
        body: { body },
      });
      if (!result.ok) return failedResult('Failed to update chat message', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error updating chat message');
    }
  },
});

export const teamsDeleteChatMessage = tool({
  description: 'Soft-delete a chat message.',
  inputSchema: z.object({
    teamsToken: tokenField,
    chatId: z.string().describe('Chat ID'),
    messageId: z.string().describe('Message ID'),
  }),
  execute: async ({ teamsToken, chatId, messageId }) => {
    try {
      const result = await graphRequest(teamsToken, `/chats/${chatId}/messages/${messageId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete chat message', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toTeamsError(error, 'Error deleting chat message');
    }
  },
});

export const teamsListChatMembers = tool({
  description: 'List members of a chat.',
  inputSchema: z.object({
    teamsToken: tokenField,
    chatId: z.string().describe('Chat ID'),
  }),
  execute: async ({ teamsToken, chatId }) => {
    try {
      const result = await graphRequest(teamsToken, `/chats/${chatId}/members`);
      if (!result.ok) return failedResult('Failed to list chat members', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error listing chat members');
    }
  },
});

export const teamsAddChatMember = tool({
  description: 'Add a member to a group chat.',
  inputSchema: z.object({
    teamsToken: tokenField,
    chatId: z.string().describe('Chat ID'),
    userId: z.string().describe('User ID or UPN to add'),
  }),
  execute: async ({ teamsToken, chatId, userId }) => {
    try {
      const result = await graphRequest(teamsToken, `/chats/${chatId}/members`, {
        method: 'POST',
        body: {
          '@odata.type': '#microsoft.graph.aadUserConversationMember',
          roles: ['owner'],
          'user@odata.bind': `https://graph.microsoft.com/v1.0/users('${userId}')`,
        },
      });
      if (!result.ok) return failedResult('Failed to add chat member', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error adding chat member');
    }
  },
});

export const teamsRemoveChatMember = tool({
  description: 'Remove a member from a group chat by membership ID.',
  inputSchema: z.object({
    teamsToken: tokenField,
    chatId: z.string().describe('Chat ID'),
    membershipId: z.string().describe('Membership ID'),
  }),
  execute: async ({ teamsToken, chatId, membershipId }) => {
    try {
      const result = await graphRequest(teamsToken, `/chats/${chatId}/members/${membershipId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to remove chat member', result);
      return result.data ?? { removed: true };
    } catch (error) {
      return toTeamsError(error, 'Error removing chat member');
    }
  },
});

export const teamsListPinnedMessages = tool({
  description: 'List pinned messages in a chat.',
  inputSchema: z.object({
    teamsToken: tokenField,
    chatId: z.string().describe('Chat ID'),
  }),
  execute: async ({ teamsToken, chatId }) => {
    try {
      const result = await graphRequest(teamsToken, `/chats/${chatId}/pinnedMessages`);
      if (!result.ok) return failedResult('Failed to list pinned messages', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error listing pinned messages');
    }
  },
});

export const teamsPinChatMessage = tool({
  description: 'Pin a message in a chat for visibility.',
  inputSchema: z.object({
    teamsToken: tokenField,
    chatId: z.string().describe('Chat ID'),
    messageId: z.string().describe('Message ID to pin'),
  }),
  execute: async ({ teamsToken, chatId, messageId }) => {
    try {
      const result = await graphRequest(teamsToken, `/chats/${chatId}/pinnedMessages`, {
        method: 'POST',
        body: { message: { id: messageId } },
      });
      if (!result.ok) return failedResult('Failed to pin chat message', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error pinning chat message');
    }
  },
});

export const teamsUnpinChatMessage = tool({
  description: 'Unpin a message in a chat by pin ID.',
  inputSchema: z.object({
    teamsToken: tokenField,
    chatId: z.string().describe('Chat ID'),
    pinId: z.string().describe('Pinned message ID'),
  }),
  execute: async ({ teamsToken, chatId, pinId }) => {
    try {
      const result = await graphRequest(teamsToken, `/chats/${chatId}/pinnedMessages/${pinId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to unpin chat message', result);
      return result.data ?? { unpinned: true };
    } catch (error) {
      return toTeamsError(error, 'Error unpinning chat message');
    }
  },
});
