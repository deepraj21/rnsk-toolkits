// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { intercomRequest, failedResult, toIntercomError, parseQuery } from './client.js';

export const intercomCreateContact = tool({
  description: 'Create a new contact (user or lead) in the Intercom workspace.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    role: z.string().optional().describe('user or lead'),
    email: z.string().optional(),
    phone: z.string().optional(),
    name: z.string().optional(),
    avatar: z.string().optional().describe('image URL'),
    ownerId: z.number().int().optional().describe('admin ID as owner'),
    externalId: z.string().optional().describe('your system identifier'),
    lastSeenAt: z.number().int().optional().describe('unix timestamp'),
    signedUpAt: z.number().int().optional().describe('unix timestamp'),
    customAttributes: z.record(z.any()).optional().describe('custom key-value fields'),
    unsubscribedFromEmails: z.boolean().optional(),
  }),
  execute: async ({
    intercomCredentials,
    role,
    email,
    phone,
    name,
    avatar,
    ownerId,
    externalId,
    lastSeenAt,
    signedUpAt,
    customAttributes,
    unsubscribedFromEmails,
  }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/contacts`, {
        method: 'POST',
        body: {
          role,
          email,
          phone,
          name,
          avatar,
          ownerId,
          externalId,
          lastSeenAt,
          signedUpAt,
          customAttributes,
          unsubscribedFromEmails,
        },
      });
      if (!result.ok) return failedResult('Failed to create contact', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error creating contact');
    }
  },
});

export const intercomGetContact = tool({
  description: 'Fetch the details of a single contact by Intercom ID.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    id: z.string(),
    includeMergeHistory: z.boolean().optional().describe('include merge history (users only)'),
  }),
  execute: async ({ intercomCredentials, id, includeMergeHistory }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/contacts/${id}`, {
        method: 'GET',
        query: { includeMergeHistory: includeMergeHistory },
      });
      if (!result.ok) return failedResult('Failed to get contact', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error getting contact');
    }
  },
});

export const intercomUpdateContactA = tool({
  description: 'Update a contact by Intercom ID, optionally attaching companies afterwards.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    id: z.string(),
    name: z.string().optional(),
    role: z.string().optional().describe('user or lead'),
    email: z.string().optional(),
    phone: z.string().optional(),
    avatar: z.string().optional(),
    ownerId: z.number().int().optional(),
    externalId: z.string().optional(),
    lastSeenAt: z.number().int().optional(),
    signedUpAt: z.number().int().optional(),
    customAttributes: z.record(z.any()).optional(),
    unsubscribedFromEmails: z.boolean().optional(),
    companies: z
      .array(z.object({ id: z.string().optional(), companyId: z.string().optional() }))
      .optional()
      .describe('companies to attach after update, each with id or companyId'),
  }),
  execute: async ({ intercomCredentials, id, companies, ...fields }) => {
    try {
      const updateBody: Record<string, any> = {};
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined) updateBody[key] = value;
      }
      const updated = await intercomRequest(intercomCredentials, `/contacts/${id}`, {
        method: 'PUT',
        body: updateBody,
      });
      if (!updated.ok) return failedResult('Failed to update contact', updated);
      const companyAttachments: any[] = [];
      for (const company of companies ?? []) {
        const companyRef = (company as any).id ?? (company as any).companyId;
        if (!companyRef) {
          companyAttachments.push({ error: 'Company needs id or companyId', company });
          continue;
        }
        const attached = await intercomRequest(intercomCredentials, `/contacts/${id}/companies`, {
          method: 'POST',
          body: { id: companyRef },
        });
        companyAttachments.push(
          attached.ok ? attached.data : failedResult('Failed to attach company', attached),
        );
      }
      return companyAttachments.length > 0 ? { ...updated.data, companyAttachments } : updated.data;
    } catch (error) {
      return toIntercomError(error, 'Error updating contact');
    }
  },
});

export const intercomUpdateContact = tool({
  description: 'Update a contact name, email, role, attributes, or subscription flags.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    contactId: z.string(),
    name: z.string().optional(),
    role: z.string().optional().describe('user or lead'),
    email: z.string().optional(),
    phone: z.string().optional(),
    avatar: z.string().optional(),
    ownerId: z.number().int().optional(),
    externalId: z.string().optional(),
    lastSeenAt: z.number().int().optional(),
    signedUpAt: z.number().int().optional(),
    customAttributes: z.record(z.any()).optional(),
    unsubscribedFromEmails: z.boolean().optional(),
  }),
  execute: async ({
    intercomCredentials,
    contactId,
    name,
    role,
    email,
    phone,
    avatar,
    ownerId,
    externalId,
    lastSeenAt,
    signedUpAt,
    customAttributes,
    unsubscribedFromEmails,
  }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/contacts/${contactId}`, {
        method: 'PUT',
        body: {
          name,
          role,
          email,
          phone,
          avatar,
          ownerId,
          externalId,
          lastSeenAt,
          signedUpAt,
          customAttributes,
          unsubscribedFromEmails,
        },
      });
      if (!result.ok) return failedResult('Failed to update contact', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error updating contact');
    }
  },
});

export const intercomDeleteContact = tool({
  description: 'Permanently delete a contact from the Intercom workspace.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    contactId: z.string(),
  }),
  execute: async ({ intercomCredentials, contactId }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/contacts/${contactId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete contact', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error deleting contact');
    }
  },
});

export const intercomArchiveContact = tool({
  description: 'Archive a single contact by ID.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    contactId: z.string(),
  }),
  execute: async ({ intercomCredentials, contactId }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/contacts/${contactId}/archive`, {
        method: 'POST',
      });
      if (!result.ok) return failedResult('Failed to archive contact', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error archiving contact');
    }
  },
});

export const intercomUnarchiveContact = tool({
  description: 'Unarchive (restore) a previously archived contact by ID.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    contactId: z.string(),
  }),
  execute: async ({ intercomCredentials, contactId }) => {
    try {
      const result = await intercomRequest(
        intercomCredentials,
        `/contacts/${contactId}/unarchive`,
        { method: 'POST' },
      );
      if (!result.ok) return failedResult('Failed to unarchive contact', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error unarchiving contact');
    }
  },
});

export const intercomBlockContact = tool({
  description: 'Block a contact; their conversations are archived too.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    contactId: z.string(),
  }),
  execute: async ({ intercomCredentials, contactId }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/contacts/${contactId}/block`, {
        method: 'POST',
      });
      if (!result.ok) return failedResult('Failed to block contact', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error blocking contact');
    }
  },
});

export const intercomMergeLeadAndUser = tool({
  description: 'Merge a lead contact into a user contact. The lead is permanently removed.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    from: z.string().describe('lead contact ID to merge away from'),
    into: z.string().describe('user contact ID to merge into'),
  }),
  execute: async ({ intercomCredentials, from, into }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/contacts/merge`, {
        method: 'POST',
        body: { from, into },
      });
      if (!result.ok) return failedResult('Failed to merge lead and user', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error merging lead and user');
    }
  },
});

export const intercomSearchContacts = tool({
  description: 'Search contacts with field/operator filters, e.g. role equals user.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    query: z
      .union([z.string(), z.record(z.any())])
      .describe(
        'filter object or JSON string, e.g. {"field":"role","operator":"=","value":"user"}',
      ),
    perPage: z.number().int().optional().describe('results per page (max 150)'),
    startingAfter: z.string().optional().describe('pagination cursor'),
  }),
  execute: async ({ intercomCredentials, query, perPage, startingAfter }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/contacts/search`, {
        method: 'POST',
        body: {
          query: parseQuery(query),
          ...(perPage !== undefined || startingAfter
            ? {
                pagination: {
                  ...(perPage !== undefined ? { per_page: perPage } : {}),
                  ...(startingAfter ? { starting_after: startingAfter } : {}),
                },
              }
            : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to search contacts', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error searching contacts');
    }
  },
});

export const intercomListContacts = tool({
  description: 'List all contacts (users and leads) with cursor pagination.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    perPage: z.number().int().optional().describe('results per page (max 150)'),
    startingAfter: z.string().optional().describe('pagination cursor'),
    includeMergeHistory: z.boolean().optional(),
  }),
  execute: async ({ intercomCredentials, perPage, startingAfter, includeMergeHistory }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/contacts`, {
        method: 'GET',
        query: {
          perPage: perPage,
          startingAfter: startingAfter,
          includeMergeHistory: includeMergeHistory,
        },
      });
      if (!result.ok) return failedResult('Failed to list contacts', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing contacts');
    }
  },
});

export const intercomShowContactByExternalId = tool({
  description: 'Fetch a contact by your external ID. Users only, not leads.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    externalId: z.string(),
    includeMergeHistory: z.boolean().optional(),
  }),
  execute: async ({ intercomCredentials, externalId, includeMergeHistory }) => {
    try {
      const result = await intercomRequest(
        intercomCredentials,
        `/contacts/find_by_external_id/${externalId}`,
        { method: 'GET', query: { includeMergeHistory: includeMergeHistory } },
      );
      if (!result.ok) return failedResult('Failed to show contact by external id', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error showing contact by external id');
    }
  },
});

export const intercomDeleteVisitor = tool({
  description: 'Permanently delete a visitor record from the workspace.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    id: z.string().describe('visitor ID'),
  }),
  execute: async ({ intercomCredentials, id }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/contacts/${id}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete visitor', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error deleting visitor');
    }
  },
});

export const intercomRetrieveVisitor = tool({
  description: 'Fetch a visitor profile, location, and activity by your user ID.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    userId: z.string().describe('your identifier for the visitor'),
  }),
  execute: async ({ intercomCredentials, userId }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/visitors`, {
        method: 'GET',
        query: { userId: userId },
      });
      if (!result.ok) return failedResult('Failed to retrieve visitor', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error retrieving visitor');
    }
  },
});

export const intercomCreateNote = tool({
  description: 'Add a note to a single contact.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    id: z.string().describe('contact ID (used when contactId is omitted)'),
    contactId: z.string().optional().describe('contact ID'),
    body: z.string().describe('note text'),
    adminId: z.string().optional().describe('authoring admin ID'),
  }),
  execute: async ({ intercomCredentials, id, contactId, body, adminId }) => {
    try {
      const targetId = contactId ?? id;
      const result = await intercomRequest(intercomCredentials, `/contacts/${targetId}/notes`, {
        method: 'POST',
        body: { body, ...(adminId ? { admin_id: adminId } : {}) },
      });
      if (!result.ok) return failedResult('Failed to create note', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error creating note');
    }
  },
});

export const intercomListNotes = tool({
  description: 'Fetch notes associated with a contact.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    id: z.string().describe('contact ID'),
  }),
  execute: async ({ intercomCredentials, id }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/contacts/${id}/notes`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to list notes', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing notes');
    }
  },
});

export const intercomRetrieveNote = tool({
  description: 'Fetch a single note by note ID.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    noteId: z.string(),
  }),
  execute: async ({ intercomCredentials, noteId }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/notes/${noteId}`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to retrieve note', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error retrieving note');
    }
  },
});

export const intercomAttachContactToCompany = tool({
  description: 'Associate a contact with a company.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    contactId: z.string(),
    companyId: z.string().describe('Intercom company ID'),
  }),
  execute: async ({ intercomCredentials, contactId, companyId }) => {
    try {
      const result = await intercomRequest(
        intercomCredentials,
        `/contacts/${contactId}/companies`,
        { method: 'POST', body: { id: companyId } },
      );
      if (!result.ok) return failedResult('Failed to attach contact to company', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error attaching contact to company');
    }
  },
});

export const intercomDetachContactFromCompany = tool({
  description: 'Remove a company association from a contact.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    contactId: z.string(),
    companyId: z.string(),
  }),
  execute: async ({ intercomCredentials, contactId, companyId }) => {
    try {
      const result = await intercomRequest(
        intercomCredentials,
        `/contacts/${contactId}/companies/${companyId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to detach contact from company', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error detaching contact from company');
    }
  },
});

export const intercomListContactCompanies = tool({
  description: 'Fetch companies associated with a contact.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    id: z.string().describe('contact ID'),
  }),
  execute: async ({ intercomCredentials, id }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/contacts/${id}/companies`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to list contact companies', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing contact companies');
    }
  },
});

export const intercomListContactSegments = tool({
  description: 'Fetch segments associated with a contact.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    contactId: z.string(),
  }),
  execute: async ({ intercomCredentials, contactId }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/contacts/${contactId}/segments`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to list contact segments', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing contact segments');
    }
  },
});

export const intercomAddTagToContact = tool({
  description: 'Attach a tag to a contact for categorization.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    contactId: z.string(),
    tagId: z.string().describe('tag ID, use intercomCreateTag to make one'),
  }),
  execute: async ({ intercomCredentials, contactId, tagId }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/contacts/${contactId}/tags`, {
        method: 'POST',
        body: { id: tagId },
      });
      if (!result.ok) return failedResult('Failed to add tag to contact', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error adding tag to contact');
    }
  },
});

export const intercomDetachContactFromTag = tool({
  description: 'Remove a tag from a contact.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    contactId: z.string(),
    tagId: z.string(),
  }),
  execute: async ({ intercomCredentials, contactId, tagId }) => {
    try {
      const result = await intercomRequest(
        intercomCredentials,
        `/contacts/${contactId}/tags/${tagId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to detach contact from tag', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error detaching contact from tag');
    }
  },
});

export const intercomRemoveTagFromContact = tool({
  description: 'Remove a tag from a specific contact, returning the removed tag.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    contactId: z.string(),
    tagId: z.string(),
  }),
  execute: async ({ intercomCredentials, contactId, tagId }) => {
    try {
      const result = await intercomRequest(
        intercomCredentials,
        `/contacts/${contactId}/tags/${tagId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to remove tag from contact', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error removing tag from contact');
    }
  },
});

export const intercomListContactTags = tool({
  description: 'Fetch all tags attached to a contact.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    contactId: z.string(),
  }),
  execute: async ({ intercomCredentials, contactId }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/contacts/${contactId}/tags`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to list contact tags', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing contact tags');
    }
  },
});

export const intercomAddContactSubscription = tool({
  description: 'Opt a contact in or out of a subscription type.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    contactId: z.string(),
    subscriptionId: z.string().describe('subscription type ID'),
    consentType: z.string().describe('opt_in or opt_out'),
  }),
  execute: async ({ intercomCredentials, contactId, subscriptionId, consentType }) => {
    try {
      const result = await intercomRequest(
        intercomCredentials,
        `/contacts/${contactId}/subscriptions`,
        { method: 'POST', body: { id: subscriptionId, consent_type: consentType } },
      );
      if (!result.ok) return failedResult('Failed to add contact subscription', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error adding contact subscription');
    }
  },
});

export const intercomRemoveContactSubscription = tool({
  description: 'Remove a subscription type from a contact.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    contactId: z.string(),
    subscriptionId: z.string(),
  }),
  execute: async ({ intercomCredentials, contactId, subscriptionId }) => {
    try {
      const result = await intercomRequest(
        intercomCredentials,
        `/contacts/${contactId}/subscriptions/${subscriptionId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to remove contact subscription', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error removing contact subscription');
    }
  },
});

export const intercomListContactSubscriptions = tool({
  description: 'Fetch opted-in and opted-out subscription types for a contact.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    contactId: z.string(),
  }),
  execute: async ({ intercomCredentials, contactId }) => {
    try {
      const result = await intercomRequest(
        intercomCredentials,
        `/contacts/${contactId}/subscriptions`,
        { method: 'GET' },
      );
      if (!result.ok) return failedResult('Failed to list contact subscriptions', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing contact subscriptions');
    }
  },
});
