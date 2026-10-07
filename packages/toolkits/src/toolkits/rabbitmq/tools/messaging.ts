// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { rabbitmqRequest, seg, failedResult, toRabbitmqError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'RabbitMQ credentials JSON with baseUrl (management URL, e.g. http://localhost:15672), username, password',
  );
const vhostField = z.string().optional().describe('Virtual host (default /)');

function vh(vhost?: string): string {
  return seg(vhost ?? '/');
}

export const rabbitmqListExchanges = tool({
  description: 'List exchanges across all vhosts with type, durability, and message rates.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    page: z.number().int().min(1).optional().describe('Page number'),
    pageSize: z.number().int().min(1).optional().describe('Exchanges per page'),
  }),
  execute: async ({ rabbitmqCredentials, page, pageSize }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, '/exchanges', {
        query: { page, page_size: pageSize },
      });
      if (!result.ok) return failedResult('Failed to list exchanges', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing exchanges');
    }
  },
});

export const rabbitmqListExchangesInVhost = tool({
  description: 'List exchanges in one vhost. Use to discover routing topology.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
  }),
  execute: async ({ rabbitmqCredentials, vhost }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, `/exchanges/${vh(vhost)}`);
      if (!result.ok) return failedResult('Failed to list exchanges in vhost', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing exchanges in vhost');
    }
  },
});

export const rabbitmqGetExchange = tool({
  description: 'Get one exchange with type, durability, arguments, and policy.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
    exchangeName: z.string().describe('Exchange name'),
  }),
  execute: async ({ rabbitmqCredentials, vhost, exchangeName }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/exchanges/${vh(vhost)}/${seg(exchangeName)}`,
      );
      if (!result.ok) return failedResult('Failed to get exchange', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error getting exchange');
    }
  },
});

export const rabbitmqDeclareExchange = tool({
  description:
    'Declare (create) an exchange: direct/topic/fanout/headers with durability and arguments. Idempotent when identical.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
    exchangeName: z.string().describe('Exchange name'),
    type: z.enum(['direct', 'topic', 'fanout', 'headers']).describe('Exchange type'),
    durable: z.boolean().optional().describe('Survive broker restart (default true)'),
    autoDelete: z.boolean().optional().describe('Delete when last queue unbinds'),
    exchangeArguments: z
      .record(z.string(), z.any())
      .optional()
      .describe('Extra arguments, e.g. alternate-exchange'),
  }),
  execute: async ({
    rabbitmqCredentials,
    vhost,
    exchangeName,
    type,
    durable,
    autoDelete,
    exchangeArguments,
  }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/exchanges/${vh(vhost)}/${seg(exchangeName)}`,
        {
          method: 'PUT',
          body: {
            type,
            ...(durable !== undefined ? { durable } : {}),
            ...(autoDelete !== undefined ? { auto_delete: autoDelete } : {}),
            ...(exchangeArguments !== undefined ? { arguments: exchangeArguments } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to declare exchange', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error declaring exchange');
    }
  },
});

export const rabbitmqDeleteExchange = tool({
  description: 'Delete an exchange (bindings are removed). Fails when ifUnused is set and bound.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
    exchangeName: z.string().describe('Exchange name'),
    ifUnused: z.boolean().optional().describe('Only delete when unused'),
  }),
  execute: async ({ rabbitmqCredentials, vhost, exchangeName, ifUnused }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/exchanges/${vh(vhost)}/${seg(exchangeName)}`,
        { method: 'DELETE', query: { 'if-unused': ifUnused === true ? true : undefined } },
      );
      if (!result.ok) return failedResult('Failed to delete exchange', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error deleting exchange');
    }
  },
});

export const rabbitmqListExchangeBindings = tool({
  description: 'List bindings with an exchange as source (downstream queues/exchanges).',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
    exchangeName: z.string().describe('Exchange name'),
  }),
  execute: async ({ rabbitmqCredentials, vhost, exchangeName }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/exchanges/${vh(vhost)}/${seg(exchangeName)}/bindings/source`,
      );
      if (!result.ok) return failedResult('Failed to list exchange bindings', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing exchange bindings');
    }
  },
});

export const rabbitmqPublishMessage = tool({
  description:
    'Publish a message to an exchange over HTTP (no AMQP client needed). Payload as string or base64; publish to amq.default with routing_key=queue name to send directly to a queue.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
    exchangeName: z.string().describe('Exchange name (amq.default for direct-to-queue)'),
    routingKey: z.string().optional().describe('Routing key (queue name for amq.default)'),
    payload: z.string().describe('Message payload (string text or base64)'),
    payloadEncoding: z.enum(['string', 'base64']).describe('Payload encoding'),
    properties: z
      .record(z.string(), z.any())
      .optional()
      .describe('Message properties, e.g. delivery_mode, content_type'),
    headers: z.record(z.string(), z.any()).optional().describe('Message headers'),
  }),
  execute: async ({
    rabbitmqCredentials,
    vhost,
    exchangeName,
    routingKey,
    payload,
    payloadEncoding,
    properties,
    headers,
  }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/exchanges/${vh(vhost)}/${seg(exchangeName)}/publish`,
        {
          method: 'POST',
          body: {
            ...(routingKey !== undefined ? { routing_key: routingKey } : {}),
            payload,
            payload_encoding: payloadEncoding,
            ...(properties !== undefined ? { properties } : {}),
            ...(headers !== undefined ? { headers } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to publish message', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error publishing message');
    }
  },
});

export const rabbitmqListQueues = tool({
  description:
    'List queues across all vhosts with depth, consumers, rates, and state. Use to spot backlogs.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    page: z.number().int().min(1).optional().describe('Page number'),
    pageSize: z.number().int().min(1).optional().describe('Queues per page'),
  }),
  execute: async ({ rabbitmqCredentials, page, pageSize }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, '/queues', {
        query: { page, page_size: pageSize },
      });
      if (!result.ok) return failedResult('Failed to list queues', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing queues');
    }
  },
});

export const rabbitmqListQueuesInVhost = tool({
  description: 'List queues in one vhost with depth and consumer counts.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
  }),
  execute: async ({ rabbitmqCredentials, vhost }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, `/queues/${vh(vhost)}`);
      if (!result.ok) return failedResult('Failed to list queues in vhost', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing queues in vhost');
    }
  },
});

export const rabbitmqGetQueue = tool({
  description:
    'Get one queue: messages ready/unacked, consumers, memory, policy, and arguments. Use to inspect backlog.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
    queueName: z.string().describe('Queue name'),
  }),
  execute: async ({ rabbitmqCredentials, vhost, queueName }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/queues/${vh(vhost)}/${seg(queueName)}`,
      );
      if (!result.ok) return failedResult('Failed to get queue', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error getting queue');
    }
  },
});

export const rabbitmqDeclareQueue = tool({
  description:
    'Declare (create) a queue: durability, auto-delete, and arguments (x-max-length, x-message-ttl, x-queue-type quorum/classic, ...). Idempotent when identical.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
    queueName: z.string().describe('Queue name'),
    durable: z.boolean().optional().describe('Survive broker restart (default true)'),
    autoDelete: z.boolean().optional().describe('Delete when last consumer unsubscribes'),
    queueArguments: z
      .record(z.string(), z.any())
      .optional()
      .describe('Queue arguments, e.g. x-queue-type, x-max-length'),
  }),
  execute: async ({
    rabbitmqCredentials,
    vhost,
    queueName,
    durable,
    autoDelete,
    queueArguments,
  }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/queues/${vh(vhost)}/${seg(queueName)}`,
        {
          method: 'PUT',
          body: {
            ...(durable !== undefined ? { durable } : {}),
            ...(autoDelete !== undefined ? { auto_delete: autoDelete } : {}),
            ...(queueArguments !== undefined ? { arguments: queueArguments } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to declare queue', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error declaring queue');
    }
  },
});

export const rabbitmqDeleteQueue = tool({
  description: 'Delete a queue and its messages. Guards ifUnused/ifEmpty prevent accidents.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
    queueName: z.string().describe('Queue name'),
    ifUnused: z.boolean().optional().describe('Only delete when unused (no consumers)'),
    ifEmpty: z.boolean().optional().describe('Only delete when empty'),
  }),
  execute: async ({ rabbitmqCredentials, vhost, queueName, ifUnused, ifEmpty }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/queues/${vh(vhost)}/${seg(queueName)}`,
        {
          method: 'DELETE',
          query: {
            'if-unused': ifUnused === true ? true : undefined,
            'if-empty': ifEmpty === true ? true : undefined,
          },
        },
      );
      if (!result.ok) return failedResult('Failed to delete queue', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error deleting queue');
    }
  },
});

export const rabbitmqListQueueBindings = tool({
  description: 'List bindings whose destination is a queue (upstream exchanges and keys).',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
    queueName: z.string().describe('Queue name'),
  }),
  execute: async ({ rabbitmqCredentials, vhost, queueName }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/queues/${vh(vhost)}/${seg(queueName)}/bindings`,
      );
      if (!result.ok) return failedResult('Failed to list queue bindings', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing queue bindings');
    }
  },
});

export const rabbitmqGetMessages = tool({
  description:
    'Fetch messages from a queue over HTTP (polling). ack_requeue_true peeks non-destructively; ack_requeue_false consumes. Prefer peeking for inspection.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
    queueName: z.string().describe('Queue name'),
    count: z.number().int().min(1).describe('Maximum messages to fetch'),
    ackmode: z
      .enum([
        'ack_requeue_true',
        'ack_requeue_false',
        'reject_requeue_true',
        'reject_requeue_false',
      ])
      .describe('ack_requeue_true peeks; ack_requeue_false consumes'),
    encoding: z.enum(['auto', 'base64']).optional().describe('Payload encoding (default auto)'),
    truncate: z.number().int().min(1).optional().describe('Truncate payloads to this many bytes'),
  }),
  execute: async ({
    rabbitmqCredentials,
    vhost,
    queueName,
    count,
    ackmode,
    encoding,
    truncate,
  }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/queues/${vh(vhost)}/${seg(queueName)}/get`,
        {
          method: 'POST',
          body: {
            count,
            ackmode,
            ...(encoding !== undefined ? { encoding } : {}),
            ...(truncate !== undefined ? { truncate } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to get messages', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error getting messages');
    }
  },
});

export const rabbitmqPurgeQueue = tool({
  description: 'Purge (drop all messages from) a queue. Consumers and bindings stay intact.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
    queueName: z.string().describe('Queue name'),
  }),
  execute: async ({ rabbitmqCredentials, vhost, queueName }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/queues/${vh(vhost)}/${seg(queueName)}/contents`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to purge queue', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error purging queue');
    }
  },
});

export const rabbitmqPauseQueue = tool({
  description: 'Pause message delivery on a quorum queue (maintenance mode).',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
    queueName: z.string().describe('Queue name'),
  }),
  execute: async ({ rabbitmqCredentials, vhost, queueName }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/queues/${vh(vhost)}/${seg(queueName)}/actions`,
        { method: 'POST', body: { action: 'pause' } },
      );
      if (!result.ok) return failedResult('Failed to pause queue', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error pausing queue');
    }
  },
});

export const rabbitmqResumeQueue = tool({
  description: 'Resume message delivery on a paused quorum queue.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
    queueName: z.string().describe('Queue name'),
  }),
  execute: async ({ rabbitmqCredentials, vhost, queueName }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/queues/${vh(vhost)}/${seg(queueName)}/actions`,
        { method: 'POST', body: { action: 'resume' } },
      );
      if (!result.ok) return failedResult('Failed to resume queue', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error resuming queue');
    }
  },
});

export const rabbitmqListBindings = tool({
  description: 'List all bindings (exchange-to-queue and exchange-to-exchange).',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
  }),
  execute: async ({ rabbitmqCredentials }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, '/bindings');
      if (!result.ok) return failedResult('Failed to list bindings', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing bindings');
    }
  },
});

export const rabbitmqListBindingsInVhost = tool({
  description: 'List all bindings in one vhost.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
  }),
  execute: async ({ rabbitmqCredentials, vhost }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, `/bindings/${vh(vhost)}`);
      if (!result.ok) return failedResult('Failed to list bindings in vhost', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing bindings in vhost');
    }
  },
});

export const rabbitmqCreateQueueBinding = tool({
  description:
    'Bind a queue to an exchange with a routing key and optional arguments. Use to wire routing topology.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
    exchangeName: z.string().describe('Source exchange'),
    queueName: z.string().describe('Destination queue'),
    routingKey: z.string().optional().describe('Routing key (default empty)'),
    bindingArguments: z
      .record(z.string(), z.any())
      .optional()
      .describe('Binding arguments (headers exchanges)'),
  }),
  execute: async ({
    rabbitmqCredentials,
    vhost,
    exchangeName,
    queueName,
    routingKey,
    bindingArguments,
  }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/bindings/${vh(vhost)}/e/${seg(exchangeName)}/q/${seg(queueName)}`,
        {
          method: 'POST',
          body: {
            ...(routingKey !== undefined ? { routing_key: routingKey } : {}),
            ...(bindingArguments !== undefined ? { arguments: bindingArguments } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create queue binding', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error creating queue binding');
    }
  },
});

export const rabbitmqDeleteQueueBinding = tool({
  description: 'Delete an exchange-to-queue binding by routing key properties name.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
    exchangeName: z.string().describe('Source exchange'),
    queueName: z.string().describe('Destination queue'),
    propertiesKey: z.string().describe('Binding properties key from the binding details'),
  }),
  execute: async ({ rabbitmqCredentials, vhost, exchangeName, queueName, propertiesKey }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/bindings/${vh(vhost)}/e/${seg(exchangeName)}/q/${seg(queueName)}/${seg(propertiesKey)}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete queue binding', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error deleting queue binding');
    }
  },
});

export const rabbitmqCreateExchangeBinding = tool({
  description: 'Bind a destination exchange to a source exchange (exchange-to-exchange binding).',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
    sourceExchange: z.string().describe('Source exchange'),
    destinationExchange: z.string().describe('Destination exchange'),
    routingKey: z.string().optional().describe('Routing key (default empty)'),
    bindingArguments: z.record(z.string(), z.any()).optional().describe('Binding arguments'),
  }),
  execute: async ({
    rabbitmqCredentials,
    vhost,
    sourceExchange,
    destinationExchange,
    routingKey,
    bindingArguments,
  }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/bindings/${vh(vhost)}/e/${seg(sourceExchange)}/e/${seg(destinationExchange)}`,
        {
          method: 'POST',
          body: {
            ...(routingKey !== undefined ? { routing_key: routingKey } : {}),
            ...(bindingArguments !== undefined ? { arguments: bindingArguments } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create exchange binding', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error creating exchange binding');
    }
  },
});

export const rabbitmqDeleteExchangeBinding = tool({
  description: 'Delete an exchange-to-exchange binding by properties key.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
    sourceExchange: z.string().describe('Source exchange'),
    destinationExchange: z.string().describe('Destination exchange'),
    propertiesKey: z.string().describe('Binding properties key from the binding details'),
  }),
  execute: async ({
    rabbitmqCredentials,
    vhost,
    sourceExchange,
    destinationExchange,
    propertiesKey,
  }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/bindings/${vh(vhost)}/e/${seg(sourceExchange)}/e/${seg(destinationExchange)}/${seg(propertiesKey)}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete exchange binding', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error deleting exchange binding');
    }
  },
});
