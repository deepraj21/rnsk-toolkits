// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { intercomRequest, failedResult, toIntercomError } from './client.js';

export const intercomCreateDataEvent = tool({
  description: 'Track a user activity event with optional metadata. Duplicates are ignored.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    eventName: z.string().describe('past-tense verb-noun, e.g. purchased-item'),
    createdAt: z.number().int().describe('unix seconds, second granularity'),
    id: z.string().optional().describe('Intercom contact ID'),
    email: z.string().optional(),
    userId: z.string().optional().describe('your user identifier'),
    metadata: z.record(z.any()).optional().describe('up to 10 flat keys'),
  }),
  execute: async ({ intercomCredentials, eventName, createdAt, id, email, userId, metadata }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/events`, {
        method: 'POST',
        body: { eventName, createdAt, id, email, userId, metadata },
      });
      if (!result.ok) return failedResult('Failed to create data event', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error creating data event');
    }
  },
});

export const intercomListDataEvents = tool({
  description: 'List events for a customer from the last 90 days.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    type: z.string().optional().describe('must be user'),
    userId: z.string().optional(),
    email: z.string().optional(),
    intercomUserId: z.string().optional(),
    summary: z.boolean().optional().describe('include summaries'),
  }),
  execute: async ({ intercomCredentials, type, userId, email, intercomUserId, summary }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/events`, {
        method: 'GET',
        query: {
          type: type,
          userId: userId,
          email: email,
          intercomUserId: intercomUserId,
          summary: summary,
        },
      });
      if (!result.ok) return failedResult('Failed to list data events', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing data events');
    }
  },
});

export const intercomCreateEventSummaries = tool({
  description: 'Bulk set event counts with first/last timestamps for a user.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    userId: z.string().describe('your user identifier'),
    eventSummaries: z
      .array(
        z.object({
          eventName: z.string(),
          count: z.number().int(),
          first: z.number().int(),
          last: z.number().int(),
        }),
      )
      .describe('each with eventName, count, first, last'),
  }),
  execute: async ({ intercomCredentials, userId, eventSummaries }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/events/summaries`, {
        method: 'POST',
        body: { userId, eventSummaries },
      });
      if (!result.ok) return failedResult('Failed to create event summaries', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error creating event summaries');
    }
  },
});

export const intercomCreateDataAttribute = tool({
  description: 'Define a custom data attribute for contacts or companies.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    name: z.string().describe('attribute key'),
    model: z.string().describe('contact or company'),
    dataType: z.string().describe('string, integer, float, boolean, or date'),
    description: z.string().optional(),
    messengerWritable: z.boolean().optional(),
    options: z
      .array(z.object({ value: z.string() }))
      .optional()
      .describe('for list-type attributes, each with value'),
  }),
  execute: async ({
    intercomCredentials,
    name,
    model,
    dataType,
    description,
    messengerWritable,
    options,
  }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/data_attributes`, {
        method: 'POST',
        body: { name, model, dataType, description, messengerWritable, options },
      });
      if (!result.ok) return failedResult('Failed to create data attribute', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error creating data attribute');
    }
  },
});

export const intercomUpdateDataAttribute = tool({
  description: 'Update a data attribute description, archive flag, or writability.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    dataAttributeId: z.number().int(),
    description: z.string().optional(),
    archived: z.boolean().optional(),
    messengerWritable: z.boolean().optional(),
    options: z.array(z.object({ value: z.string() })).optional(),
  }),
  execute: async ({
    intercomCredentials,
    dataAttributeId,
    description,
    archived,
    messengerWritable,
    options,
  }) => {
    try {
      const result = await intercomRequest(
        intercomCredentials,
        `/data_attributes/${dataAttributeId}`,
        { method: 'PUT', body: { description, archived, messengerWritable, options } },
      );
      if (!result.ok) return failedResult('Failed to update data attribute', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error updating data attribute');
    }
  },
});

export const intercomListDataAttributes = tool({
  description: 'List data attributes for contacts or companies.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    model: z.string().optional().describe('contact or company'),
    includeArchived: z.boolean().optional(),
  }),
  execute: async ({ intercomCredentials, model, includeArchived }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/data_attributes`, {
        method: 'GET',
        query: { model: model, includeArchived: includeArchived },
      });
      if (!result.ok) return failedResult('Failed to list data attributes', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing data attributes');
    }
  },
});

export const intercomCreateDataExport = tool({
  description: 'Start an async message-engagement data export job for a time range.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    createdAtAfter: z.number().int().describe('unix seconds, range start'),
    createdAtBefore: z.number().int().describe('unix seconds, range end'),
  }),
  execute: async ({ intercomCredentials, createdAtAfter, createdAtBefore }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/export/content/data`, {
        method: 'POST',
        body: { createdAtAfter, createdAtBefore },
      });
      if (!result.ok) return failedResult('Failed to create data export', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error creating data export');
    }
  },
});

export const intercomRetrieveDataExportJob = tool({
  description: 'Check a data export job status and download URL. Jobs expire after two days.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    jobIdentifier: z.string(),
  }),
  execute: async ({ intercomCredentials, jobIdentifier }) => {
    try {
      const result = await intercomRequest(
        intercomCredentials,
        `/export/content/data/${jobIdentifier}`,
        { method: 'GET' },
      );
      if (!result.ok) return failedResult('Failed to retrieve data export job', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error retrieving data export job');
    }
  },
});

export const intercomCancelDataExport = tool({
  description: 'Cancel an active data export job.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    jobIdentifier: z.string(),
  }),
  execute: async ({ intercomCredentials, jobIdentifier }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/export/cancel/${jobIdentifier}`, {
        method: 'POST',
      });
      if (!result.ok) return failedResult('Failed to cancel data export', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error canceling data export');
    }
  },
});

export const intercomDownloadDataExport = tool({
  description: 'Download a completed export as gzipped CSV (base64, capped).',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    jobIdentifier: z.string().describe('from a completed job download_url'),
  }),
  execute: async ({ intercomCredentials, jobIdentifier }) => {
    try {
      const result = await intercomRequest(
        intercomCredentials,
        `/download/content/data/${jobIdentifier}`,
        { method: 'GET', acceptOctetStream: true },
      );
      if (!result.ok) return failedResult('Failed to download data export', result);
      const { contentType, sizeBytes, contentBase64 } = result.data;
      const LIMIT = 500 * 1024;
      const truncated = sizeBytes > LIMIT;
      return {
        contentType,
        sizeBytes,
        truncated,
        contentBase64: truncated ? contentBase64.slice(0, LIMIT) : contentBase64,
        note: truncated
          ? 'Gzipped CSV truncated to the first 500KB of base64; re-download via API for the full file.'
          : 'Gzipped CSV content as base64.',
      };
    } catch (error) {
      return toIntercomError(error, 'Error downloading data export');
    }
  },
});

export const intercomRetrieveJobStatus = tool({
  description: 'Check an async bulk job status, e.g. from enqueued ticket creation.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    jobId: z.string(),
  }),
  execute: async ({ intercomCredentials, jobId }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/jobs/status/${jobId}`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to retrieve job status', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error retrieving job status');
    }
  },
});

export const intercomGetCounts = tool({
  description:
    'Get entity counts: app totals, conversation states, or per-tag/segment/user breakdowns.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    type: z.string().optional().describe('conversation, company, user, or admin'),
    count: z.string().optional().describe('tag, segment, user, or admin'),
    perPage: z.number().int().optional(),
  }),
  execute: async ({ intercomCredentials, type, count, perPage }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/counts`, {
        method: 'GET',
        query: { type: type, count: count, perPage: perPage },
      });
      if (!result.ok) return failedResult('Failed to get counts', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error getting counts');
    }
  },
});

export const intercomGetCustomObjectInstance = tool({
  description: 'Fetch a custom object instance by your external ID.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    customObjectTypeIdentifier: z.string().describe("e.g. 'Order'"),
    externalId: z.string().optional(),
    referencesContactId: z.string().optional(),
    referencesConversationId: z.string().optional(),
    page: z.number().int().optional(),
    perPage: z.number().int().optional().describe('max 150'),
  }),
  execute: async ({
    intercomCredentials,
    customObjectTypeIdentifier,
    externalId,
    referencesContactId,
    referencesConversationId,
    page,
    perPage,
  }) => {
    try {
      const result = await intercomRequest(
        intercomCredentials,
        `/custom_object_instances/${customObjectTypeIdentifier}`,
        {
          method: 'GET',
          query: {
            externalId: externalId,
            referencesContactId: referencesContactId,
            referencesConversationId: referencesConversationId,
            page: page,
            perPage: perPage,
          },
        },
      );
      if (!result.ok) return failedResult('Failed to get custom object instance', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error getting custom object instance');
    }
  },
});
