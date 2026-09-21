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
function entry(name: string, description: string, toolRef: any, scope: Scope): { name: string; description: string; tool: any; requiredAuth: typeof auth; scope: Scope } {
    return { name, description, tool: toolRef, requiredAuth: auth, scope };
}

export const telegramTools = [
    entry('telegramSendMessage', 'Sends a text message to a chat.', sendMessage, 'write'),
    entry('telegramForwardMessage', 'Forwards a message to another chat.', forwardMessage, 'write'),
    entry('telegramEditMessage', 'Edits a bot-authored text message.', editMessage, 'write'),
    entry('telegramDeleteMessage', 'Deletes a message.', deleteMessage, 'delete'),
    entry('telegramSendPhoto', 'Sends a photo by file_id or public URL.', sendPhoto, 'write'),
    entry('telegramSendDocument', 'Sends a file preserving original format.', sendDocument, 'write'),
    entry('telegramSendLocation', 'Sends a map point (static or live).', sendLocation, 'write'),
    entry('telegramSendPoll', 'Sends a native poll (regular or quiz).', sendPoll, 'write'),
    entry('telegramGetChat', 'Reads current chat info.', getChat, 'read'),
    entry('telegramGetChatAdministrators', 'Lists chat admins with privilege flags.', getChatAdministrators, 'read'),
    entry('telegramGetChatMember', 'Reads one member status/role.', getChatMember, 'read'),
    entry('telegramGetChatMembersCount', 'Returns the member count (admin required).', getChatMembersCount, 'read'),
    entry('telegramCreateChatInviteLink', 'Generates a new primary invite link.', createChatInviteLink, 'write'),
    entry('telegramGetUpdates', 'Long-polls incoming updates.', getUpdates, 'read'),
    entry('telegramGetChatHistory', 'Reads recent chat messages via the updates queue (composite).', getChatHistory, 'read'),
    entry('telegramAnswerCallbackQuery', 'Answers an inline-keyboard callback query.', answerCallbackQuery, 'write'),
    entry('telegramGetMe', 'Returns bot identity and validates the token.', getMe, 'read'),
    entry('telegramSetMyCommands', 'Replaces the bot command menu.', setMyCommands, 'write'),
];
