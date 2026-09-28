// @ts-nocheck
import {
  createChatInviteLink,
  getChat,
  getChatAdministrators,
  getChatMember,
  getChatMembersCount,
} from './chats.js';
import { getMe, setMyCommands } from './bot.js';
import {
  deleteMessage,
  editMessage,
  forwardMessage,
  sendDocument,
  sendLocation,
  sendMessage,
  sendPhoto,
  sendPoll,
} from './messages.js';
import { answerCallbackQuery, getChatHistory, getUpdates } from './updates.js';

export {
  sendMessage,
  forwardMessage,
  editMessage,
  deleteMessage,
  sendPhoto,
  sendDocument,
  sendLocation,
  sendPoll,
  getChat,
  getChatAdministrators,
  getChatMember,
  getChatMembersCount,
  createChatInviteLink,
  getUpdates,
  getChatHistory,
  answerCallbackQuery,
  getMe,
  setMyCommands,
};

const auth = 'telegramBotToken' as const;

type Scope = 'read' | 'write' | 'delete';
function entry(
  name: string,
  description: string,
  toolRef: any,
  scope: Scope,
  keywords: string[] = [],
): {
  name: string;
  description: string;
  tool: any;
  requiredAuth: typeof auth;
  scope: Scope;
  keywords: string[];
} {
  return { name, description, tool: toolRef, requiredAuth: auth, scope, keywords };
}

export const telegramTools = [
  entry('telegramSendMessage', 'Sends a text message to a chat.', sendMessage, 'write', [
    'message',
    'dm',
    'text',
  ]),
  entry('telegramForwardMessage', 'Forwards a message to another chat.', forwardMessage, 'write', [
    'share',
    'resend',
  ]),
  entry('telegramEditMessage', 'Edits a bot-authored text message.', editMessage, 'write', [
    'update',
    'message',
  ]),
  entry('telegramDeleteMessage', 'Deletes a message.', deleteMessage, 'delete', [
    'remove',
    'message',
  ]),
  entry('telegramSendPhoto', 'Sends a photo by file_id or public URL.', sendPhoto, 'write', [
    'image',
    'picture',
    'photo',
  ]),
  entry('telegramSendDocument', 'Sends a file preserving original format.', sendDocument, 'write', [
    'file',
    'attachment',
    'upload',
  ]),
  entry('telegramSendLocation', 'Sends a map point (static or live).', sendLocation, 'write', [
    'location',
    'gps',
    'map',
  ]),
  entry('telegramSendPoll', 'Sends a native poll (regular or quiz).', sendPoll, 'write', [
    'vote',
    'survey',
    'quiz',
  ]),
  entry('telegramGetChat', 'Reads current chat info.', getChat, 'read', ['group', 'channel']),
  entry(
    'telegramGetChatAdministrators',
    'Lists chat admins with privilege flags.',
    getChatAdministrators,
    'read',
    ['admin', 'admins', 'moderator'],
  ),
  entry('telegramGetChatMember', 'Reads one member status/role.', getChatMember, 'read', [
    'member',
    'user',
  ]),
  entry(
    'telegramGetChatMembersCount',
    'Returns the member count (admin required).',
    getChatMembersCount,
    'read',
    ['member', 'members', 'count'],
  ),
  entry(
    'telegramCreateChatInviteLink',
    'Generates a new primary invite link.',
    createChatInviteLink,
    'write',
    ['invite', 'join', 'link'],
  ),
  entry('telegramGetUpdates', 'Long-polls incoming updates.', getUpdates, 'read', [
    'poll',
    'events',
    'webhook',
  ]),
  entry(
    'telegramGetChatHistory',
    'Reads recent chat messages via the updates queue (composite).',
    getChatHistory,
    'read',
    ['history', 'message', 'messages'],
  ),
  entry(
    'telegramAnswerCallbackQuery',
    'Answers an inline-keyboard callback query.',
    answerCallbackQuery,
    'write',
    ['button', 'callback'],
  ),
  entry('telegramGetMe', 'Returns bot identity and validates the token.', getMe, 'read', [
    'whoami',
    'bot',
  ]),
  entry('telegramSetMyCommands', 'Replaces the bot command menu.', setMyCommands, 'write', [
    'command',
    'commands',
    'menu',
  ]),
];
