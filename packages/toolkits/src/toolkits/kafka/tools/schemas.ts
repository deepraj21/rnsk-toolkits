// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { schemaRegistryRequest, failedResult, toKafkaError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Kafka credentials JSON with schemaRegistryUrl, schemaRegistryApiKey, schemaRegistryApiSecret',
  );
const subjectField = z.string().describe('Subject name, e.g. orders-value');
const SR_CONTENT_TYPE = 'application/vnd.schemaregistry.v1+json';

export const kafkaListSubjects = tool({
  description: 'List all subjects in the Schema Registry. Use to discover event schemas.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    subjectPrefix: z.string().optional().describe('Only subjects starting with this prefix'),
    deleted: z.boolean().optional().describe('Include soft-deleted subjects'),
  }),
  execute: async ({ kafkaCredentials, subjectPrefix, deleted }) => {
    try {
      const result = await schemaRegistryRequest(kafkaCredentials, '/subjects', {
        query: { subjectPrefix, deleted },
      });
      if (!result.ok) return failedResult('Failed to list subjects', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error listing subjects');
    }
  },
});

export const kafkaListSubjectVersions = tool({
  description: 'List version numbers registered under a subject.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    subject: subjectField,
    deleted: z.boolean().optional().describe('Include soft-deleted versions'),
  }),
  execute: async ({ kafkaCredentials, subject, deleted }) => {
    try {
      const result = await schemaRegistryRequest(
        kafkaCredentials,
        `/subjects/${subject}/versions`,
        {
          query: { deleted },
        },
      );
      if (!result.ok) return failedResult('Failed to list subject versions', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error listing subject versions');
    }
  },
});

export const kafkaGetSchemaVersion = tool({
  description: 'Get one schema version with ID, type, schema text, and references.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    subject: subjectField,
    version: z.string().describe('Version number or "latest"'),
  }),
  execute: async ({ kafkaCredentials, subject, version }) => {
    try {
      const result = await schemaRegistryRequest(
        kafkaCredentials,
        `/subjects/${subject}/versions/${version}`,
      );
      if (!result.ok) return failedResult('Failed to get schema version', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error getting schema version');
    }
  },
});

export const kafkaGetSchemaById = tool({
  description: 'Get a schema by its global ID with type and text.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    schemaId: z.number().int().describe('Global schema ID'),
  }),
  execute: async ({ kafkaCredentials, schemaId }) => {
    try {
      const result = await schemaRegistryRequest(kafkaCredentials, `/schemas/ids/${schemaId}`);
      if (!result.ok) return failedResult('Failed to get schema by ID', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error getting schema by ID');
    }
  },
});

export const kafkaRegisterSchema = tool({
  description:
    'Register a schema under a subject (new version). Must satisfy the subject compatibility level; returns the schema ID.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    subject: subjectField,
    schema: z.string().describe('Schema text (Avro/JSON Schema/Protobuf as a JSON-escaped string)'),
    schemaType: z
      .enum(['AVRO', 'JSON', 'PROTOBUF'])
      .optional()
      .describe('Schema type (defaults to AVRO)'),
  }),
  execute: async ({ kafkaCredentials, subject, schema, schemaType }) => {
    try {
      const result = await schemaRegistryRequest(
        kafkaCredentials,
        `/subjects/${subject}/versions`,
        {
          method: 'POST',
          contentType: SR_CONTENT_TYPE,
          body: {
            schema,
            ...(schemaType !== undefined ? { schemaType } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to register schema', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error registering schema');
    }
  },
});

export const kafkaLookupSchema = tool({
  description: 'Look up the subject/version holding an exact schema text.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    subject: subjectField,
    schema: z.string().describe('Schema text to look up'),
    schemaType: z.enum(['AVRO', 'JSON', 'PROTOBUF']).optional().describe('Schema type'),
  }),
  execute: async ({ kafkaCredentials, subject, schema, schemaType }) => {
    try {
      const result = await schemaRegistryRequest(kafkaCredentials, `/subjects/${subject}`, {
        method: 'POST',
        contentType: SR_CONTENT_TYPE,
        body: {
          schema,
          ...(schemaType !== undefined ? { schemaType } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to look up schema', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error looking up schema');
    }
  },
});

export const kafkaDeleteSubject = tool({
  description: 'Soft-delete a subject (all versions); permanent flag hard-deletes.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    subject: subjectField,
    permanent: z.boolean().optional().describe('Hard-delete instead of soft-delete'),
  }),
  execute: async ({ kafkaCredentials, subject, permanent }) => {
    try {
      const result = await schemaRegistryRequest(kafkaCredentials, `/subjects/${subject}`, {
        method: 'DELETE',
        query: { permanent },
      });
      if (!result.ok) return failedResult('Failed to delete subject', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error deleting subject');
    }
  },
});

export const kafkaDeleteSchemaVersion = tool({
  description: 'Soft-delete one schema version; permanent flag hard-deletes.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    subject: subjectField,
    version: z.string().describe('Version number to delete'),
    permanent: z.boolean().optional().describe('Hard-delete instead of soft-delete'),
  }),
  execute: async ({ kafkaCredentials, subject, version, permanent }) => {
    try {
      const result = await schemaRegistryRequest(
        kafkaCredentials,
        `/subjects/${subject}/versions/${version}`,
        { method: 'DELETE', query: { permanent } },
      );
      if (!result.ok) return failedResult('Failed to delete schema version', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error deleting schema version');
    }
  },
});

export const kafkaGetGlobalCompatibility = tool({
  description: 'Get the global schema compatibility level (BACKWARD, FORWARD, FULL, NONE, ...).',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
  }),
  execute: async ({ kafkaCredentials }) => {
    try {
      const result = await schemaRegistryRequest(kafkaCredentials, '/config');
      if (!result.ok) return failedResult('Failed to get global compatibility', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error getting global compatibility');
    }
  },
});

export const kafkaUpdateGlobalCompatibility = tool({
  description: 'Set the global schema compatibility level for the registry.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    compatibility: z
      .enum([
        'BACKWARD',
        'BACKWARD_TRANSITIVE',
        'FORWARD',
        'FORWARD_TRANSITIVE',
        'FULL',
        'FULL_TRANSITIVE',
        'NONE',
      ])
      .describe('Compatibility level'),
  }),
  execute: async ({ kafkaCredentials, compatibility }) => {
    try {
      const result = await schemaRegistryRequest(kafkaCredentials, '/config', {
        method: 'PUT',
        contentType: SR_CONTENT_TYPE,
        body: { compatibility },
      });
      if (!result.ok) return failedResult('Failed to update global compatibility', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error updating global compatibility');
    }
  },
});

export const kafkaGetSubjectCompatibility = tool({
  description: 'Get the compatibility level configured for one subject.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    subject: subjectField,
    defaultToGlobal: z.boolean().optional().describe('Fall back to global when unset'),
  }),
  execute: async ({ kafkaCredentials, subject, defaultToGlobal }) => {
    try {
      const result = await schemaRegistryRequest(kafkaCredentials, `/config/${subject}`, {
        query: { defaultToGlobal },
      });
      if (!result.ok) return failedResult('Failed to get subject compatibility', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error getting subject compatibility');
    }
  },
});

export const kafkaUpdateSubjectCompatibility = tool({
  description: 'Set the compatibility level for one subject.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    subject: subjectField,
    compatibility: z
      .enum([
        'BACKWARD',
        'BACKWARD_TRANSITIVE',
        'FORWARD',
        'FORWARD_TRANSITIVE',
        'FULL',
        'FULL_TRANSITIVE',
        'NONE',
      ])
      .describe('Compatibility level'),
  }),
  execute: async ({ kafkaCredentials, subject, compatibility }) => {
    try {
      const result = await schemaRegistryRequest(kafkaCredentials, `/config/${subject}`, {
        method: 'PUT',
        contentType: SR_CONTENT_TYPE,
        body: { compatibility },
      });
      if (!result.ok) return failedResult('Failed to update subject compatibility', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error updating subject compatibility');
    }
  },
});

export const kafkaTestCompatibility = tool({
  description:
    'Test whether a candidate schema is compatible with a subject latest version (or all versions per level). Dry-run for safe evolution.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    subject: subjectField,
    schema: z.string().describe('Candidate schema text'),
    schemaType: z.enum(['AVRO', 'JSON', 'PROTOBUF']).optional().describe('Schema type'),
    version: z.string().optional().describe('Version to test against (default latest)'),
    verbose: z.boolean().optional().describe('Return detailed failure reasons'),
  }),
  execute: async ({ kafkaCredentials, subject, schema, schemaType, version, verbose }) => {
    try {
      const path = version
        ? `/compatibility/subjects/${subject}/versions/${version}`
        : `/compatibility/subjects/${subject}/versions/latest`;
      const result = await schemaRegistryRequest(kafkaCredentials, path, {
        method: 'POST',
        contentType: SR_CONTENT_TYPE,
        query: { verbose },
        body: {
          schema,
          ...(schemaType !== undefined ? { schemaType } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to test compatibility', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error testing compatibility');
    }
  },
});
