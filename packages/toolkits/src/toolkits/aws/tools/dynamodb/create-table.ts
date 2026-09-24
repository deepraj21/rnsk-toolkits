import { tool } from 'ai';
import { z } from 'zod';
import { CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { createDynamoDbClient } from '../client.js';

export const awsCreateDynamodbTable = tool({
  description: 'Create a new DynamoDB table with attributes and keys.. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    tableName: z.string().describe('Name of the table'),
    attributeDefinitions: z.array(z.record(z.any())).describe('Attribute definitions'),
    properties: z.string().optional().describe('properties'),
    AttributeName: z.string().optional().describe('Attribute name'),
    AttributeType: z.string().optional().describe('S (string), N (number), B (binary)'),
    keySchema: z.array(z.record(z.any())).describe('Key schema (partition key and optional sort key)'),
    KeyType: z.string().optional().describe('HASH (partition key) or RANGE (sort key)'),
    billingMode: z.string().describe('PROVISIONED or PAY_PER_REQUEST'),
    provisionedThroughput: z.record(z.any()).optional().describe('Required if billingMode is PROVISIONED'),
    ReadCapacityUnits: z.number().optional().describe('ReadCapacityUnits'),
    WriteCapacityUnits: z.number().optional().describe('WriteCapacityUnits'),
    globalSecondaryIndexes: z.array(z.record(z.any())).optional().describe('Global secondary indexes'),
    IndexName: z.string().optional().describe('IndexName'),
    KeySchema: z.array(z.record(z.any())).optional().describe('KeySchema'),
    Projection: z.record(z.any()).optional().describe('Projection'),
  }),
  execute: async ({ awsCredentials, region, tableName, attributeDefinitions, properties, AttributeName, AttributeType, keySchema, KeyType, billingMode, provisionedThroughput, ReadCapacityUnits, WriteCapacityUnits, globalSecondaryIndexes, IndexName, KeySchema, Projection }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createDynamoDbClient(awsCredentials, region);

      const command = new CreateTableCommand({
          TableName: tableName,
          AttributeDefinitions: attributeDefinitions,
          KeySchema: keySchema,
          BillingMode: billingMode,
          ProvisionedThroughput: provisionedThroughput,
          GlobalSecondaryIndexes: globalSecondaryIndexes,
      } as any);
      const response = await client.send(command);
      return response.TableDescription;
    } catch (err) {
      return { error: 'Failed to create a new DynamoDB table with attributes and keys', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
