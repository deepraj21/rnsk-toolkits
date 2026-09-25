// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { getCollection, missingCredentialsError, reviveIds, toJson } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');
const dbField = z.string().optional().describe('Database name (defaults to the one stored in MongoDB credentials)');
const collField = z.string().describe('Collection name');
const objectIdFieldsField = z
  .array(z.string())
  .optional()
  .describe('Extra field names whose 24-hex string values should convert to ObjectId (besides _id).');

export const mongodbAggregate = tool({
  description: 'Run an aggregation pipeline ($match, $group, $lookup, $unwind, …) for analytics and reports. Defaults to 100 docs.',
  inputSchema: z.object({
    mongodbCredentials: authField,
    database: dbField,
    collection: collField,
    pipeline: z
      .array(z.record(z.any()))
      .min(1)
      .max(50)
      .describe('Pipeline stages, e.g. [{"$match": {"status": "active"}}, {"$group": {"_id": "$city", "count": {"$sum": 1}}}].'),
    limit: z.number().int().min(1).max(5000).optional().describe('Max documents (default 100).'),
    objectIdFields: objectIdFieldsField,
  }),
  execute: async ({ mongodbCredentials, database, collection, pipeline, limit, objectIdFields }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const coll = await getCollection(mongodbCredentials, database, collection);
      const docs = await coll.aggregate(reviveIds(pipeline, objectIdFields)).limit(limit ?? 100).toArray();
      const out = toJson(docs);
      return { count: Array.isArray(out) ? out.length : 0, documents: out };
    } catch (error) {
      return { error: 'Failed to run aggregation', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const mongodbCountDocuments = tool({
  description: 'Count documents matching a filter exactly (scans the collection). Use for filtered totals.',
  inputSchema: z.object({
    mongodbCredentials: authField,
    database: dbField,
    collection: collField,
    filter: z.record(z.any()).optional().describe('Query filter (default counts all).'),
    limit: z.number().int().min(1).optional().describe('Stop counting after N matches.'),
    objectIdFields: objectIdFieldsField,
  }),
  execute: async ({ mongodbCredentials, database, collection, filter, limit, objectIdFields }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const coll = await getCollection(mongodbCredentials, database, collection);
      const count = await coll.countDocuments(reviveIds(filter ?? {}, objectIdFields), { limit });
      return { count };
    } catch (error) {
      return { error: 'Failed to count documents', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const mongodbEstimatedDocumentCount = tool({
  description: 'Fast estimated collection size from metadata (no filter). Use for quick size checks on large collections.',
  inputSchema: z.object({
    mongodbCredentials: authField,
    database: dbField,
    collection: collField,
  }),
  execute: async ({ mongodbCredentials, database, collection }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const coll = await getCollection(mongodbCredentials, database, collection);
      const count = await coll.estimatedDocumentCount();
      return { count };
    } catch (error) {
      return { error: 'Failed to estimate document count', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const mongodbDistinct = tool({
  description: 'List distinct values of a field, optionally filtered. Use for dropdowns, facets and cardinality checks.',
  inputSchema: z.object({
    mongodbCredentials: authField,
    database: dbField,
    collection: collField,
    field: z.string().describe('Field path, e.g. "status" or "address.city".'),
    filter: z.record(z.any()).optional().describe('Query filter narrowing the documents.'),
    objectIdFields: objectIdFieldsField,
  }),
  execute: async ({ mongodbCredentials, database, collection, field, filter, objectIdFields }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const coll = await getCollection(mongodbCredentials, database, collection);
      const values = await coll.distinct(field, reviveIds(filter ?? {}, objectIdFields));
      const out = toJson(values);
      return { count: Array.isArray(out) ? out.length : 0, values: out };
    } catch (error) {
      return { error: 'Failed to get distinct values', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
