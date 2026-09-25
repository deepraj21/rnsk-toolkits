// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { getCollection, missingCredentialsError, reviveIds, toJson } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');
const dbField = z.string().optional().describe('Database name (defaults to the one stored in MongoDB credentials)');
const collField = z.string().describe('Collection name');
const filterField = z
  .record(z.any())
  .optional()
  .describe('MongoDB query filter, e.g. {"status": "active", "age": {"$gte": 18}}. 24-hex _id strings auto-convert to ObjectId.');
const objectIdFieldsField = z
  .array(z.string())
  .optional()
  .describe('Extra field names whose 24-hex string values should convert to ObjectId (besides _id).');
const writeResult = (result) => ({
  acknowledged: result?.acknowledged,
  matchedCount: result?.matchedCount,
  modifiedCount: result?.modifiedCount,
  upsertedCount: result?.upsertedCount,
  upsertedId: result?.upsertedId,
  insertedId: result?.insertedId,
  insertedCount: result?.insertedCount,
  deletedCount: result?.deletedCount,
});

export const mongodbFindDocuments = tool({
  description: 'Find documents with filter, projection, sort, skip and limit. Defaults to 50 docs (max 1000). Use for reads and exploration.',
  inputSchema: z.object({
    mongodbCredentials: authField,
    database: dbField,
    collection: collField,
    filter: filterField,
    projection: z.record(z.any()).optional().describe('Fields to include/exclude, e.g. {"name": 1, "password": 0}.'),
    sort: z.record(z.any()).optional().describe('Sort spec, e.g. {"createdAt": -1}.'),
    limit: z.number().int().min(1).max(1000).optional().describe('Max documents (default 50).'),
    skip: z.number().int().min(0).optional().describe('Documents to skip for pagination.'),
    objectIdFields: objectIdFieldsField,
  }),
  execute: async ({ mongodbCredentials, database, collection, filter, projection, sort, limit, skip, objectIdFields }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const coll = await getCollection(mongodbCredentials, database, collection);
      const docs = await coll
        .find(reviveIds(filter ?? {}, objectIdFields), { projection, sort, limit: limit ?? 50, skip })
        .toArray();
      const out = toJson(docs);
      return { count: Array.isArray(out) ? out.length : 0, documents: out };
    } catch (error) {
      return { error: 'Failed to find documents', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const mongodbFindOne = tool({
  description: 'Find the first document matching a filter. Use for fetching a single record by id or unique key.',
  inputSchema: z.object({
    mongodbCredentials: authField,
    database: dbField,
    collection: collField,
    filter: z.record(z.any()).describe('Query filter, e.g. {"_id": "507f1f77bcf86cd799439011"}.'),
    projection: z.record(z.any()).optional().describe('Fields to include/exclude.'),
    sort: z.record(z.any()).optional().describe('Sort to pick which matching document wins.'),
    objectIdFields: objectIdFieldsField,
  }),
  execute: async ({ mongodbCredentials, database, collection, filter, projection, sort, objectIdFields }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const coll = await getCollection(mongodbCredentials, database, collection);
      const doc = await coll.findOne(reviveIds(filter, objectIdFields), { projection, sort });
      return { document: toJson(doc) };
    } catch (error) {
      return { error: 'Failed to find document', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const mongodbInsertOne = tool({
  description: 'Insert a single document into a collection. Returns the generated _id.',
  inputSchema: z.object({
    mongodbCredentials: authField,
    database: dbField,
    collection: collField,
    document: z.record(z.any()).describe('Document to insert.'),
  }),
  execute: async ({ mongodbCredentials, database, collection, document }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const coll = await getCollection(mongodbCredentials, database, collection);
      const result = await coll.insertOne(reviveIds(document));
      return toJson({ acknowledged: result.acknowledged, insertedId: result.insertedId });
    } catch (error) {
      return { error: 'Failed to insert document', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const mongodbInsertMany = tool({
  description: 'Insert multiple documents in one batch (max 1000 per call). Returns inserted ids.',
  inputSchema: z.object({
    mongodbCredentials: authField,
    database: dbField,
    collection: collField,
    documents: z.array(z.record(z.any())).min(1).max(1000).describe('Documents to insert.'),
    ordered: z.boolean().optional().describe('Stop on first error (default true).'),
  }),
  execute: async ({ mongodbCredentials, database, collection, documents, ordered }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const coll = await getCollection(mongodbCredentials, database, collection);
      const result = await coll.insertMany(reviveIds(documents), { ordered });
      return toJson({ acknowledged: result.acknowledged, insertedCount: result.insertedCount, insertedIds: result.insertedIds });
    } catch (error) {
      return { error: 'Failed to insert documents', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const mongodbUpdateOne = tool({
  description: 'Update the first document matching a filter with $set/$inc/etc. Supports upsert.',
  inputSchema: z.object({
    mongodbCredentials: authField,
    database: dbField,
    collection: collField,
    filter: z.record(z.any()).describe('Query filter selecting the document.'),
    update: z.record(z.any()).describe('Update operators, e.g. {"$set": {"status": "done"}}.'),
    upsert: z.boolean().optional().describe('Insert when nothing matches.'),
    objectIdFields: objectIdFieldsField,
  }),
  execute: async ({ mongodbCredentials, database, collection, filter, update, upsert, objectIdFields }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const coll = await getCollection(mongodbCredentials, database, collection);
      const result = await coll.updateOne(reviveIds(filter, objectIdFields), reviveIds(update, objectIdFields), { upsert });
      return toJson(writeResult(result));
    } catch (error) {
      return { error: 'Failed to update document', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const mongodbUpdateMany = tool({
  description: 'Update all documents matching a filter. Use for bulk status changes and migrations.',
  inputSchema: z.object({
    mongodbCredentials: authField,
    database: dbField,
    collection: collField,
    filter: z.record(z.any()).describe('Query filter selecting documents.'),
    update: z.record(z.any()).describe('Update operators, e.g. {"$set": {"archived": true}}.'),
    upsert: z.boolean().optional().describe('Insert when nothing matches.'),
    objectIdFields: objectIdFieldsField,
  }),
  execute: async ({ mongodbCredentials, database, collection, filter, update, upsert, objectIdFields }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const coll = await getCollection(mongodbCredentials, database, collection);
      const result = await coll.updateMany(reviveIds(filter, objectIdFields), reviveIds(update, objectIdFields), { upsert });
      return toJson(writeResult(result));
    } catch (error) {
      return { error: 'Failed to update documents', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const mongodbReplaceOne = tool({
  description: 'Replace a whole document (keeping _id) with a new one. Supports upsert.',
  inputSchema: z.object({
    mongodbCredentials: authField,
    database: dbField,
    collection: collField,
    filter: z.record(z.any()).describe('Query filter selecting the document.'),
    replacement: z.record(z.any()).describe('Full replacement document (no update operators).'),
    upsert: z.boolean().optional().describe('Insert when nothing matches.'),
    objectIdFields: objectIdFieldsField,
  }),
  execute: async ({ mongodbCredentials, database, collection, filter, replacement, upsert, objectIdFields }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const coll = await getCollection(mongodbCredentials, database, collection);
      const result = await coll.replaceOne(reviveIds(filter, objectIdFields), reviveIds(replacement, objectIdFields), { upsert });
      return toJson(writeResult(result));
    } catch (error) {
      return { error: 'Failed to replace document', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const mongodbDeleteOne = tool({
  description: 'Delete the first document matching a filter.',
  inputSchema: z.object({
    mongodbCredentials: authField,
    database: dbField,
    collection: collField,
    filter: z.record(z.any()).describe('Query filter selecting the document.'),
    objectIdFields: objectIdFieldsField,
  }),
  execute: async ({ mongodbCredentials, database, collection, filter, objectIdFields }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const coll = await getCollection(mongodbCredentials, database, collection);
      const result = await coll.deleteOne(reviveIds(filter, objectIdFields));
      return toJson(writeResult(result));
    } catch (error) {
      return { error: 'Failed to delete document', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const mongodbDeleteMany = tool({
  description: 'Delete all documents matching a filter. Returns the deleted count — confirm scope with the user first on broad filters.',
  inputSchema: z.object({
    mongodbCredentials: authField,
    database: dbField,
    collection: collField,
    filter: z.record(z.any()).describe('Query filter selecting documents.'),
    objectIdFields: objectIdFieldsField,
  }),
  execute: async ({ mongodbCredentials, database, collection, filter, objectIdFields }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const coll = await getCollection(mongodbCredentials, database, collection);
      const result = await coll.deleteMany(reviveIds(filter, objectIdFields));
      return toJson(writeResult(result));
    } catch (error) {
      return { error: 'Failed to delete documents', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const mongodbFindOneAndUpdate = tool({
  description: 'Atomically update one document and return it (before or after the change). Use for counters, reservations and read-modify-write.',
  inputSchema: z.object({
    mongodbCredentials: authField,
    database: dbField,
    collection: collField,
    filter: z.record(z.any()).describe('Query filter selecting the document.'),
    update: z.record(z.any()).describe('Update operators.'),
    returnAfter: z.boolean().optional().describe('Return the updated document (default returns the original).'),
    upsert: z.boolean().optional().describe('Insert when nothing matches.'),
    sort: z.record(z.any()).optional().describe('Sort to pick among matches.'),
    objectIdFields: objectIdFieldsField,
  }),
  execute: async ({ mongodbCredentials, database, collection, filter, update, returnAfter, upsert, sort, objectIdFields }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const coll = await getCollection(mongodbCredentials, database, collection);
      const doc = await coll.findOneAndUpdate(reviveIds(filter, objectIdFields), reviveIds(update, objectIdFields), {
        returnDocument: returnAfter ? 'after' : 'before',
        upsert,
        sort,
      });
      return { document: toJson(doc) };
    } catch (error) {
      return { error: 'Failed to find and update document', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const mongodbFindOneAndDelete = tool({
  description: 'Atomically delete one document and return it. Use for queue-style claim-and-remove patterns.',
  inputSchema: z.object({
    mongodbCredentials: authField,
    database: dbField,
    collection: collField,
    filter: z.record(z.any()).describe('Query filter selecting the document.'),
    sort: z.record(z.any()).optional().describe('Sort to pick among matches.'),
    objectIdFields: objectIdFieldsField,
  }),
  execute: async ({ mongodbCredentials, database, collection, filter, sort, objectIdFields }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const coll = await getCollection(mongodbCredentials, database, collection);
      const doc = await coll.findOneAndDelete(reviveIds(filter, objectIdFields), { sort });
      return { document: toJson(doc) };
    } catch (error) {
      return { error: 'Failed to find and delete document', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const mongodbBulkWrite = tool({
  description: 'Run mixed insert/update/delete operations in one batch for efficiency. Each entry uses insertOne/updateOne/updateMany/deleteOne/deleteMany/replaceOne shapes.',
  inputSchema: z.object({
    mongodbCredentials: authField,
    database: dbField,
    collection: collField,
    operations: z
      .array(z.record(z.any()))
      .min(1)
      .max(1000)
      .describe('Bulk models, e.g. [{"insertOne": {"document": {...}}}, {"updateMany": {"filter": {...}, "update": {"$set": {...}}}}].'),
    ordered: z.boolean().optional().describe('Stop on first error (default true).'),
    objectIdFields: objectIdFieldsField,
  }),
  execute: async ({ mongodbCredentials, database, collection, operations, ordered, objectIdFields }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const coll = await getCollection(mongodbCredentials, database, collection);
      const result = await coll.bulkWrite(reviveIds(operations, objectIdFields), { ordered });
      return toJson({
        acknowledged: result.acknowledged,
        insertedCount: result.insertedCount,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        deletedCount: result.deletedCount,
        upsertedCount: result.upsertedCount,
        upsertedIds: result.upsertedIds,
        insertedIds: result.insertedIds,
      });
    } catch (error) {
      return { error: 'Failed to bulk write', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
