// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { graphRequest, mailboxBase, failedResult, toOutlookError } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const mailboxField = z
  .string()
  .optional()
  .describe('Mailbox user ID or UPN for shared/delegated mailboxes (default signed-in user)');
const messageIdField = z.string().describe('Message ID');

const recipientField = z
  .object({
    address: z.string().describe('Email address'),
    name: z.string().optional().describe('Display name'),
  })
  .describe('Recipient');

const messageField = z
  .record(z.string(), z.any())
  .describe(
    'Message object: subject, body {contentType: Text|HTML, content}, toRecipients/ccRecipients/bccRecipients [{emailAddress:{address}}], importance, flag, attachments, internetMessageHeaders',
  );

export const outlookListMessages = tool({
  description:
    'List or search inbox messages with OData search, filter, ordering, and paging. Use $search for keyword queries.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    search: z.string().optional().describe('Keyword search, e.g. "quarterly report"'),
    filter: z.string().optional().describe('OData filter, e.g. isRead eq false'),
    orderBy: z.string().optional().describe('Order, e.g. receivedDateTime desc'),
    select: z.string().optional().describe('Comma-separated fields to return'),
    top: z.number().int().min(1).max(100).optional().describe('Messages per page'),
    skip: z.number().int().min(0).optional().describe('Messages to skip'),
  }),
  execute: async ({ outlookToken, mailbox, search, filter, orderBy, select, top, skip }) => {
    try {
      const result = await graphRequest(outlookToken, `${mailboxBase(mailbox)}/messages`, {
        query: {
          $search: search !== undefined ? `"${search}"` : undefined,
          $filter: filter,
          $orderby: orderBy,
          $select: select,
          $top: top,
          $skip: skip,
        },
      });
      if (!result.ok) return failedResult('Failed to list messages', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error listing messages');
    }
  },
});

export const outlookGetMessage = tool({
  description: 'Get one message with full body, headers, recipients, and flags.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    messageId: messageIdField,
    select: z.string().optional().describe('Comma-separated fields to return'),
  }),
  execute: async ({ outlookToken, mailbox, messageId, select }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/messages/${messageId}`,
        { query: { $select: select } },
      );
      if (!result.ok) return failedResult('Failed to get message', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error getting message');
    }
  },
});

export const outlookSendMail = tool({
  description:
    'Send an email in one call: recipients, subject, HTML/text body, attachments, importance, and flags.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    message: messageField,
    saveToSentItems: z.boolean().optional().describe('Save to Sent Items (default true)'),
  }),
  execute: async ({ outlookToken, mailbox, message, saveToSentItems }) => {
    try {
      const result = await graphRequest(outlookToken, `${mailboxBase(mailbox)}/sendMail`, {
        method: 'POST',
        body: {
          message,
          ...(saveToSentItems !== undefined ? { saveToSentItems } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to send mail', result);
      return result.data ?? { sent: true };
    } catch (error) {
      return toOutlookError(error, 'Error sending mail');
    }
  },
});

export const outlookCreateDraft = tool({
  description: 'Create a draft message to send or edit later. Returns the draft message.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    message: messageField,
  }),
  execute: async ({ outlookToken, mailbox, message }) => {
    try {
      const result = await graphRequest(outlookToken, `${mailboxBase(mailbox)}/messages`, {
        method: 'POST',
        body: message,
      });
      if (!result.ok) return failedResult('Failed to create draft', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error creating draft');
    }
  },
});

export const outlookUpdateDraft = tool({
  description: 'Update a draft message (subject, body, recipients).',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    messageId: messageIdField,
    message: z.record(z.string(), z.any()).describe('Message fields to update'),
  }),
  execute: async ({ outlookToken, mailbox, messageId, message }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/messages/${messageId}`,
        { method: 'PATCH', body: message },
      );
      if (!result.ok) return failedResult('Failed to update draft', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error updating draft');
    }
  },
});

export const outlookSendDraft = tool({
  description: 'Send an existing draft (new, reply, reply-all, or forward draft).',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    messageId: messageIdField,
  }),
  execute: async ({ outlookToken, mailbox, messageId }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/messages/${messageId}/send`,
        { method: 'POST' },
      );
      if (!result.ok) return failedResult('Failed to send draft', result);
      return result.data ?? { sent: true };
    } catch (error) {
      return toOutlookError(error, 'Error sending draft');
    }
  },
});

export const outlookDeleteMessage = tool({
  description: 'Delete (move to Deleted Items) a message.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    messageId: messageIdField,
  }),
  execute: async ({ outlookToken, mailbox, messageId }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/messages/${messageId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete message', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toOutlookError(error, 'Error deleting message');
    }
  },
});

export const outlookReplyMessage = tool({
  description: 'Reply to a message with an optional comment and message overrides.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    messageId: messageIdField,
    comment: z.string().optional().describe('Reply text (HTML supported)'),
    message: messageField.optional().describe('Optional message overrides'),
  }),
  execute: async ({ outlookToken, mailbox, messageId, comment, message }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/messages/${messageId}/reply`,
        {
          method: 'POST',
          body: {
            ...(comment !== undefined ? { comment } : {}),
            ...(message !== undefined ? { message } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to reply to message', result);
      return result.data ?? { replied: true };
    } catch (error) {
      return toOutlookError(error, 'Error replying to message');
    }
  },
});

export const outlookReplyAllMessage = tool({
  description: 'Reply-all to a message with an optional comment.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    messageId: messageIdField,
    comment: z.string().optional().describe('Reply text (HTML supported)'),
  }),
  execute: async ({ outlookToken, mailbox, messageId, comment }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/messages/${messageId}/replyAll`,
        {
          method: 'POST',
          body: comment !== undefined ? { comment } : {},
        },
      );
      if (!result.ok) return failedResult('Failed to reply-all to message', result);
      return result.data ?? { replied: true };
    } catch (error) {
      return toOutlookError(error, 'Error replying-all to message');
    }
  },
});

export const outlookForwardMessage = tool({
  description: 'Forward a message to recipients with an optional comment.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    messageId: messageIdField,
    toRecipients: z.array(recipientField).min(1).describe('Forward recipients as {address, name?}'),
    comment: z.string().optional().describe('Forwarding comment (HTML supported)'),
  }),
  execute: async ({ outlookToken, mailbox, messageId, toRecipients, comment }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/messages/${messageId}/forward`,
        {
          method: 'POST',
          body: {
            toRecipients: toRecipients.map((r) => ({ emailAddress: r })),
            ...(comment !== undefined ? { comment } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to forward message', result);
      return result.data ?? { forwarded: true };
    } catch (error) {
      return toOutlookError(error, 'Error forwarding message');
    }
  },
});

export const outlookCreateReplyDraft = tool({
  description: 'Create a reply draft for a message to edit and send later.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    messageId: messageIdField,
    comment: z.string().optional().describe('Draft reply text'),
  }),
  execute: async ({ outlookToken, mailbox, messageId, comment }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/messages/${messageId}/createReply`,
        {
          method: 'POST',
          body: comment !== undefined ? { comment } : {},
        },
      );
      if (!result.ok) return failedResult('Failed to create reply draft', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error creating reply draft');
    }
  },
});

export const outlookCreateForwardDraft = tool({
  description: 'Create a forward draft for a message to edit and send later.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    messageId: messageIdField,
    toRecipients: z.array(recipientField).optional().describe('Forward recipients'),
    comment: z.string().optional().describe('Draft comment'),
  }),
  execute: async ({ outlookToken, mailbox, messageId, toRecipients, comment }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/messages/${messageId}/createForward`,
        {
          method: 'POST',
          body: {
            ...(toRecipients !== undefined
              ? { toRecipients: toRecipients.map((r) => ({ emailAddress: r })) }
              : {}),
            ...(comment !== undefined ? { comment } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create forward draft', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error creating forward draft');
    }
  },
});

export const outlookSetMessageReadStatus = tool({
  description: 'Mark a message read or unread.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    messageId: messageIdField,
    isRead: z.boolean().describe('True to mark read, false to mark unread'),
  }),
  execute: async ({ outlookToken, mailbox, messageId, isRead }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/messages/${messageId}`,
        { method: 'PATCH', body: { isRead } },
      );
      if (!result.ok) return failedResult('Failed to set read status', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error setting read status');
    }
  },
});

export const outlookMoveMessage = tool({
  description: 'Move a message to another mail folder (inbox, archive, custom folder ID).',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    messageId: messageIdField,
    destinationId: z
      .string()
      .describe(
        'Destination folder ID or well-known name (inbox, drafts, sentitems, deleteditems, archive)',
      ),
  }),
  execute: async ({ outlookToken, mailbox, messageId, destinationId }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/messages/${messageId}/move`,
        { method: 'POST', body: { destinationId } },
      );
      if (!result.ok) return failedResult('Failed to move message', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error moving message');
    }
  },
});

export const outlookCopyMessage = tool({
  description: 'Copy a message to another mail folder.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    messageId: messageIdField,
    destinationId: z.string().describe('Destination folder ID or well-known name'),
  }),
  execute: async ({ outlookToken, mailbox, messageId, destinationId }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/messages/${messageId}/copy`,
        { method: 'POST', body: { destinationId } },
      );
      if (!result.ok) return failedResult('Failed to copy message', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error copying message');
    }
  },
});

export const outlookListMailFolders = tool({
  description: 'List mail folders (inbox, drafts, sent, archive, custom) with counts.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
  }),
  execute: async ({ outlookToken, mailbox }) => {
    try {
      const result = await graphRequest(outlookToken, `${mailboxBase(mailbox)}/mailFolders`);
      if (!result.ok) return failedResult('Failed to list mail folders', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error listing mail folders');
    }
  },
});

export const outlookGetMailFolder = tool({
  description: 'Get one mail folder with unread/total counts.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    folderId: z
      .string()
      .describe('Folder ID or well-known name (inbox, drafts, sentitems, deleteditems, archive)'),
  }),
  execute: async ({ outlookToken, mailbox, folderId }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/mailFolders/${folderId}`,
      );
      if (!result.ok) return failedResult('Failed to get mail folder', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error getting mail folder');
    }
  },
});

export const outlookCreateMailFolder = tool({
  description: 'Create a mail folder, optionally nested under a parent folder.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    displayName: z.string().describe('Folder display name'),
    parentFolderId: z.string().optional().describe('Parent folder ID (omit for top level)'),
  }),
  execute: async ({ outlookToken, mailbox, displayName, parentFolderId }) => {
    try {
      const base =
        parentFolderId !== undefined
          ? `${mailboxBase(mailbox)}/mailFolders/${parentFolderId}/childFolders`
          : `${mailboxBase(mailbox)}/mailFolders`;
      const result = await graphRequest(outlookToken, base, {
        method: 'POST',
        body: { displayName },
      });
      if (!result.ok) return failedResult('Failed to create mail folder', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error creating mail folder');
    }
  },
});

export const outlookUpdateMailFolder = tool({
  description: 'Rename a mail folder.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    folderId: z.string().describe('Folder ID'),
    displayName: z.string().describe('New display name'),
  }),
  execute: async ({ outlookToken, mailbox, folderId, displayName }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/mailFolders/${folderId}`,
        { method: 'PATCH', body: { displayName } },
      );
      if (!result.ok) return failedResult('Failed to update mail folder', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error updating mail folder');
    }
  },
});

export const outlookDeleteMailFolder = tool({
  description: 'Delete a mail folder and its contents.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    folderId: z.string().describe('Folder ID'),
  }),
  execute: async ({ outlookToken, mailbox, folderId }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/mailFolders/${folderId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete mail folder', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toOutlookError(error, 'Error deleting mail folder');
    }
  },
});

export const outlookListFolderMessages = tool({
  description: 'List messages inside one mail folder with search and paging.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    folderId: z.string().describe('Folder ID or well-known name'),
    search: z.string().optional().describe('Keyword search'),
    filter: z.string().optional().describe('OData filter'),
    top: z.number().int().min(1).max(100).optional().describe('Messages per page'),
    skip: z.number().int().min(0).optional().describe('Messages to skip'),
  }),
  execute: async ({ outlookToken, mailbox, folderId, search, filter, top, skip }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/mailFolders/${folderId}/messages`,
        {
          query: {
            $search: search !== undefined ? `"${search}"` : undefined,
            $filter: filter,
            $top: top,
            $skip: skip,
          },
        },
      );
      if (!result.ok) return failedResult('Failed to list folder messages', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error listing folder messages');
    }
  },
});

export const outlookListAttachments = tool({
  description: 'List attachments of a message with names, sizes, and types.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    messageId: messageIdField,
  }),
  execute: async ({ outlookToken, mailbox, messageId }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/messages/${messageId}/attachments`,
      );
      if (!result.ok) return failedResult('Failed to list attachments', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error listing attachments');
    }
  },
});

export const outlookGetAttachment = tool({
  description: 'Get one attachment metadata; use expandRaw for file bytes (contentBytes).',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    messageId: messageIdField,
    attachmentId: z.string().describe('Attachment ID'),
    expandRaw: z.boolean().optional().describe('Return raw contentBytes for file attachments'),
  }),
  execute: async ({ outlookToken, mailbox, messageId, attachmentId, expandRaw }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/messages/${messageId}/attachments/${attachmentId}`,
        {
          query: {
            $expand: expandRaw === true ? 'microsoft.graph.itemAttachment/item' : undefined,
          },
        },
      );
      if (!result.ok) return failedResult('Failed to get attachment', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error getting attachment');
    }
  },
});

export const outlookAddAttachment = tool({
  description:
    'Attach a file to a draft message (base64 contentBytes, up to ~3MB; use upload sessions for larger).',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    messageId: messageIdField,
    name: z.string().describe('File name, e.g. report.pdf'),
    contentType: z.string().describe('MIME type, e.g. application/pdf'),
    contentBytes: z.string().describe('File content base64-encoded'),
  }),
  execute: async ({ outlookToken, mailbox, messageId, name, contentType, contentBytes }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/messages/${messageId}/attachments`,
        {
          method: 'POST',
          body: {
            '@odata.type': '#microsoft.graph.fileAttachment',
            name,
            contentType,
            contentBytes,
          },
        },
      );
      if (!result.ok) return failedResult('Failed to add attachment', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error adding attachment');
    }
  },
});

export const outlookDeleteAttachment = tool({
  description: 'Delete an attachment from a draft message.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    messageId: messageIdField,
    attachmentId: z.string().describe('Attachment ID'),
  }),
  execute: async ({ outlookToken, mailbox, messageId, attachmentId }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/messages/${messageId}/attachments/${attachmentId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete attachment', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toOutlookError(error, 'Error deleting attachment');
    }
  },
});

export const outlookListMessageRules = tool({
  description: 'List inbox message rules (conditions, actions, order).',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
  }),
  execute: async ({ outlookToken, mailbox }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/mailFolders/inbox/messageRules`,
      );
      if (!result.ok) return failedResult('Failed to list message rules', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error listing message rules');
    }
  },
});

export const outlookCreateMessageRule = tool({
  description:
    'Create an inbox rule: display name, sequence, conditions (from/subject/headers), and actions (move/copy/delete/mark/forward).',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    rule: z
      .record(z.string(), z.any())
      .describe(
        'Rule: displayName, sequence, isEnabled, conditions {fromAddresses, subjectContains,...}, actions {moveToFolder, delete, markAsRead, forwardTo, ...}',
      ),
  }),
  execute: async ({ outlookToken, mailbox, rule }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/mailFolders/inbox/messageRules`,
        { method: 'POST', body: rule },
      );
      if (!result.ok) return failedResult('Failed to create message rule', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error creating message rule');
    }
  },
});

export const outlookUpdateMessageRule = tool({
  description: 'Update an inbox message rule (conditions, actions, enabled state).',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    ruleId: z.string().describe('Rule ID'),
    rule: z.record(z.string(), z.any()).describe('Rule fields to update'),
  }),
  execute: async ({ outlookToken, mailbox, ruleId, rule }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/mailFolders/inbox/messageRules/${ruleId}`,
        { method: 'PATCH', body: rule },
      );
      if (!result.ok) return failedResult('Failed to update message rule', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error updating message rule');
    }
  },
});

export const outlookDeleteMessageRule = tool({
  description: 'Delete an inbox message rule.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    ruleId: z.string().describe('Rule ID'),
  }),
  execute: async ({ outlookToken, mailbox, ruleId }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/mailFolders/inbox/messageRules/${ruleId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete message rule', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toOutlookError(error, 'Error deleting message rule');
    }
  },
});

export const outlookListCategories = tool({
  description: 'List the master category list (names and colors) for mail, events, and contacts.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
  }),
  execute: async ({ outlookToken, mailbox }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/outlook/masterCategories`,
      );
      if (!result.ok) return failedResult('Failed to list categories', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error listing categories');
    }
  },
});

export const outlookCreateCategory = tool({
  description: 'Create a master category with a display name and preset color.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    displayName: z.string().describe('Category display name'),
    color: z.string().optional().describe('Preset color, e.g. preset0..preset24'),
  }),
  execute: async ({ outlookToken, mailbox, displayName, color }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/outlook/masterCategories`,
        {
          method: 'POST',
          body: {
            displayName,
            ...(color !== undefined ? { color } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create category', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error creating category');
    }
  },
});

export const outlookUpdateCategory = tool({
  description: 'Update a master category name or color.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    categoryId: z.string().describe('Category ID'),
    displayName: z.string().optional().describe('New display name'),
    color: z.string().optional().describe('New preset color'),
  }),
  execute: async ({ outlookToken, mailbox, categoryId, displayName, color }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/outlook/masterCategories/${categoryId}`,
        {
          method: 'PATCH',
          body: {
            ...(displayName !== undefined ? { displayName } : {}),
            ...(color !== undefined ? { color } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to update category', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error updating category');
    }
  },
});

export const outlookDeleteCategory = tool({
  description: 'Delete a master category.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    categoryId: z.string().describe('Category ID'),
  }),
  execute: async ({ outlookToken, mailbox, categoryId }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/outlook/masterCategories/${categoryId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete category', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toOutlookError(error, 'Error deleting category');
    }
  },
});

export const outlookListFocusedOverrides = tool({
  description: 'List Focused Inbox overrides (senders always classified focused/other).',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
  }),
  execute: async ({ outlookToken, mailbox }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/inferenceClassification/overrides`,
      );
      if (!result.ok) return failedResult('Failed to list focused overrides', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error listing focused overrides');
    }
  },
});

export const outlookCreateFocusedOverride = tool({
  description: 'Always classify a sender as focused or other.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    senderEmail: z.string().describe('Sender email address'),
    classifyAs: z.enum(['focused', 'other']).describe('Classification for this sender'),
  }),
  execute: async ({ outlookToken, mailbox, senderEmail, classifyAs }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/inferenceClassification/overrides`,
        {
          method: 'POST',
          body: {
            senderEmailAddress: { address: senderEmail },
            classifyAs,
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create focused override', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error creating focused override');
    }
  },
});

export const outlookDeleteFocusedOverride = tool({
  description: 'Delete a Focused Inbox override.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    overrideId: z.string().describe('Override ID'),
  }),
  execute: async ({ outlookToken, mailbox, overrideId }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/inferenceClassification/overrides/${overrideId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete focused override', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toOutlookError(error, 'Error deleting focused override');
    }
  },
});
