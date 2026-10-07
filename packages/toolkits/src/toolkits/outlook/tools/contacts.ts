// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { graphRequest, mailboxBase, failedResult, toOutlookError } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const mailboxField = z
  .string()
  .optional()
  .describe('Mailbox user ID or UPN for shared/delegated mailboxes (default signed-in user)');

export const outlookListContacts = tool({
  description: 'List personal contacts with search, filter, and paging.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    search: z.string().optional().describe('Search display names, emails, companies'),
    filter: z.string().optional().describe('OData filter'),
    top: z.number().int().min(1).max(100).optional().describe('Contacts per page'),
    skip: z.number().int().min(0).optional().describe('Contacts to skip'),
  }),
  execute: async ({ outlookToken, mailbox, search, filter, top, skip }) => {
    try {
      const result = await graphRequest(outlookToken, `${mailboxBase(mailbox)}/contacts`, {
        query: {
          $search: search !== undefined ? `"${search}"` : undefined,
          $filter: filter,
          $top: top,
          $skip: skip,
        },
      });
      if (!result.ok) return failedResult('Failed to list contacts', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error listing contacts');
    }
  },
});

export const outlookGetContact = tool({
  description: 'Get one contact with emails, phones, addresses, and company.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    contactId: z.string().describe('Contact ID'),
  }),
  execute: async ({ outlookToken, mailbox, contactId }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/contacts/${contactId}`,
      );
      if (!result.ok) return failedResult('Failed to get contact', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error getting contact');
    }
  },
});

export const outlookCreateContact = tool({
  description:
    'Create a contact: name, emails [{address}], phones [{type, number}], company, job title, addresses.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    contact: z
      .record(z.string(), z.any())
      .describe(
        'Contact: givenName, surname, displayName, emailAddresses [{address, name}], businessPhones [], mobilePhone, companyName, jobTitle, businessAddress {street, city, state, postalCode, countryOrRegion}',
      ),
  }),
  execute: async ({ outlookToken, mailbox, contact }) => {
    try {
      const result = await graphRequest(outlookToken, `${mailboxBase(mailbox)}/contacts`, {
        method: 'POST',
        body: contact,
      });
      if (!result.ok) return failedResult('Failed to create contact', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error creating contact');
    }
  },
});

export const outlookUpdateContact = tool({
  description: 'Update a contact (name, emails, phones, company).',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    contactId: z.string().describe('Contact ID'),
    contact: z.record(z.string(), z.any()).describe('Contact fields to update'),
  }),
  execute: async ({ outlookToken, mailbox, contactId, contact }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/contacts/${contactId}`,
        { method: 'PATCH', body: contact },
      );
      if (!result.ok) return failedResult('Failed to update contact', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error updating contact');
    }
  },
});

export const outlookDeleteContact = tool({
  description: 'Delete a contact.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    contactId: z.string().describe('Contact ID'),
  }),
  execute: async ({ outlookToken, mailbox, contactId }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/contacts/${contactId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete contact', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toOutlookError(error, 'Error deleting contact');
    }
  },
});

export const outlookListContactFolders = tool({
  description: 'List contact folders. Use to discover folder IDs.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
  }),
  execute: async ({ outlookToken, mailbox }) => {
    try {
      const result = await graphRequest(outlookToken, `${mailboxBase(mailbox)}/contactFolders`);
      if (!result.ok) return failedResult('Failed to list contact folders', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error listing contact folders');
    }
  },
});

export const outlookCreateContactFolder = tool({
  description: 'Create a contact folder, optionally nested under a parent.',
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
          ? `${mailboxBase(mailbox)}/contactFolders/${parentFolderId}/childFolders`
          : `${mailboxBase(mailbox)}/contactFolders`;
      const result = await graphRequest(outlookToken, base, {
        method: 'POST',
        body: { displayName },
      });
      if (!result.ok) return failedResult('Failed to create contact folder', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error creating contact folder');
    }
  },
});

export const outlookUpdateContactFolder = tool({
  description: 'Rename a contact folder.',
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
        `${mailboxBase(mailbox)}/contactFolders/${folderId}`,
        { method: 'PATCH', body: { displayName } },
      );
      if (!result.ok) return failedResult('Failed to update contact folder', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error updating contact folder');
    }
  },
});

export const outlookDeleteContactFolder = tool({
  description: 'Delete a contact folder and its contacts.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    folderId: z.string().describe('Folder ID'),
  }),
  execute: async ({ outlookToken, mailbox, folderId }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/contactFolders/${folderId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete contact folder', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toOutlookError(error, 'Error deleting contact folder');
    }
  },
});

export const outlookListFolderContacts = tool({
  description: 'List contacts inside one contact folder.',
  inputSchema: z.object({
    outlookToken: tokenField,
    mailbox: mailboxField,
    folderId: z.string().describe('Folder ID'),
    top: z.number().int().min(1).max(100).optional().describe('Contacts per page'),
  }),
  execute: async ({ outlookToken, mailbox, folderId, top }) => {
    try {
      const result = await graphRequest(
        outlookToken,
        `${mailboxBase(mailbox)}/contactFolders/${folderId}/contacts`,
        { query: { $top: top } },
      );
      if (!result.ok) return failedResult('Failed to list folder contacts', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error listing folder contacts');
    }
  },
});

export const outlookSearchPeople = tool({
  description:
    'Search relevant people across mail, directory, and contacts (fuzzy name/email match). Use for autocomplete and lookups.',
  inputSchema: z.object({
    outlookToken: tokenField,
    search: z.string().describe('Search text, e.g. a name or email fragment'),
    top: z.number().int().min(1).max(100).optional().describe('Results per page'),
  }),
  execute: async ({ outlookToken, search, top }) => {
    try {
      const result = await graphRequest(outlookToken, '/me/people', {
        query: { $search: `"${search}"`, $top: top },
      });
      if (!result.ok) return failedResult('Failed to search people', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error searching people');
    }
  },
});

export const outlookGetMe = tool({
  description:
    'Get the signed-in user profile (name, email, job, office). Use to verify identity and connectivity.',
  inputSchema: z.object({
    outlookToken: tokenField,
  }),
  execute: async ({ outlookToken }) => {
    try {
      const result = await graphRequest(outlookToken, '/me');
      if (!result.ok) return failedResult('Failed to get profile', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error getting profile');
    }
  },
});

export const outlookGetMyPhoto = tool({
  description: 'Get the signed-in user profile photo as base64 with content type.',
  inputSchema: z.object({
    outlookToken: tokenField,
  }),
  execute: async ({ outlookToken }) => {
    try {
      if (!outlookToken) {
        return {
          error: 'Failed to get photo',
          statusCode: 401,
          details: { error: 'Outlook token is required. Connect Outlook first.' },
        };
      }
      const response = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
        headers: { Authorization: `Bearer ${outlookToken}` },
      });
      if (!response.ok) {
        const details = await response.json().catch(() => null);
        return { error: 'Failed to get photo', statusCode: response.status, details };
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      return {
        contentType: response.headers.get('content-type') ?? 'image/jpeg',
        size: buffer.length,
        contentBase64: buffer.toString('base64'),
      };
    } catch (error) {
      return toOutlookError(error, 'Error getting photo');
    }
  },
});

export const outlookListSubscriptions = tool({
  description: 'List change-notification subscriptions (webhooks) on mail, calendar, contacts.',
  inputSchema: z.object({
    outlookToken: tokenField,
  }),
  execute: async ({ outlookToken }) => {
    try {
      const result = await graphRequest(outlookToken, '/subscriptions');
      if (!result.ok) return failedResult('Failed to list subscriptions', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error listing subscriptions');
    }
  },
});

export const outlookGetSubscription = tool({
  description: 'Get one subscription with resource, expiry, and notification URL.',
  inputSchema: z.object({
    outlookToken: tokenField,
    subscriptionId: z.string().describe('Subscription ID'),
  }),
  execute: async ({ outlookToken, subscriptionId }) => {
    try {
      const result = await graphRequest(outlookToken, `/subscriptions/${subscriptionId}`);
      if (!result.ok) return failedResult('Failed to get subscription', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error getting subscription');
    }
  },
});

export const outlookCreateSubscription = tool({
  description:
    'Subscribe to change notifications on a resource (e.g. me/messages, me/events, me/contacts). Notification URL must be HTTPS and validated.',
  inputSchema: z.object({
    outlookToken: tokenField,
    changeType: z.string().describe('Comma-separated types: created, updated, deleted'),
    notificationUrl: z.string().describe('HTTPS endpoint receiving notifications'),
    resource: z
      .string()
      .describe(
        "Resource path, e.g. me/messages, me/mailFolders('inbox')/messages, me/events, me/contacts",
      ),
    expirationDateTime: z
      .string()
      .describe('Expiry ISO datetime (max ~3 days for mail/calendar; see Graph limits)'),
    clientState: z.string().optional().describe('Opaque client state echoed in notifications'),
  }),
  execute: async ({
    outlookToken,
    changeType,
    notificationUrl,
    resource,
    expirationDateTime,
    clientState,
  }) => {
    try {
      const result = await graphRequest(outlookToken, '/subscriptions', {
        method: 'POST',
        body: {
          changeType,
          notificationUrl,
          resource,
          expirationDateTime,
          ...(clientState !== undefined ? { clientState } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create subscription', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error creating subscription');
    }
  },
});

export const outlookRenewSubscription = tool({
  description: 'Extend a subscription expiry (renew before it lapses).',
  inputSchema: z.object({
    outlookToken: tokenField,
    subscriptionId: z.string().describe('Subscription ID'),
    expirationDateTime: z.string().describe('New expiry ISO datetime'),
  }),
  execute: async ({ outlookToken, subscriptionId, expirationDateTime }) => {
    try {
      const result = await graphRequest(outlookToken, `/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        body: { expirationDateTime },
      });
      if (!result.ok) return failedResult('Failed to renew subscription', result);
      return result.data;
    } catch (error) {
      return toOutlookError(error, 'Error renewing subscription');
    }
  },
});

export const outlookDeleteSubscription = tool({
  description: 'Delete a change-notification subscription.',
  inputSchema: z.object({
    outlookToken: tokenField,
    subscriptionId: z.string().describe('Subscription ID'),
  }),
  execute: async ({ outlookToken, subscriptionId }) => {
    try {
      const result = await graphRequest(outlookToken, `/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete subscription', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toOutlookError(error, 'Error deleting subscription');
    }
  },
});
