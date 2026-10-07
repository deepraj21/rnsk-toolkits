// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { redisRequest, failedResult, toRedisError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Redis credentials JSON with accountKey and secretKey (Redis Cloud API keys from Access Management)',
  );

export const redisListPeerings = tool({
  description: 'List VPC peerings of a subscription.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: z.number().int().describe('Subscription ID'),
  }),
  execute: async ({ redisCredentials, subscriptionId }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/peerings`,
      );
      if (!result.ok) return failedResult('Failed to list peerings', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error listing peerings');
    }
  },
});

export const redisCreatePeering = tool({
  description: 'Create a VPC peering for a subscription (AWS/GCP/Azure spec).',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: z.number().int().describe('Subscription ID'),
    peering: z
      .record(z.string(), z.any())
      .describe(
        'Peering spec: provider, region, awsAccountId/vpcId/vpcCidr (AWS) or projectId/networkName (GCP)',
      ),
  }),
  execute: async ({ redisCredentials, subscriptionId, peering }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/peerings`,
        {
          method: 'POST',
          body: peering,
        },
      );
      if (!result.ok) return failedResult('Failed to create peering', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error creating peering');
    }
  },
});

export const redisUpdatePeering = tool({
  description: 'Update a VPC peering (e.g. accept routes or change CIDRs).',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: z.number().int().describe('Subscription ID'),
    peeringId: z.number().int().describe('Peering ID'),
    peering: z.record(z.string(), z.any()).describe('Peering fields to update'),
  }),
  execute: async ({ redisCredentials, subscriptionId, peeringId, peering }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/peerings/${peeringId}`,
        { method: 'PUT', body: peering },
      );
      if (!result.ok) return failedResult('Failed to update peering', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error updating peering');
    }
  },
});

export const redisDeletePeering = tool({
  description: 'Delete a VPC peering.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: z.number().int().describe('Subscription ID'),
    peeringId: z.number().int().describe('Peering ID'),
  }),
  execute: async ({ redisCredentials, subscriptionId, peeringId }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/peerings/${peeringId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete peering', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error deleting peering');
    }
  },
});

export const redisListRegionsInSubscription = tool({
  description: 'List regions attached to a subscription (Active-Active).',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: z.number().int().describe('Subscription ID'),
  }),
  execute: async ({ redisCredentials, subscriptionId }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/regions`,
      );
      if (!result.ok) return failedResult('Failed to list subscription regions', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error listing subscription regions');
    }
  },
});

export const redisCreateSubscriptionRegion = tool({
  description: 'Attach a region to a subscription (Active-Active).',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: z.number().int().describe('Subscription ID'),
    region: z
      .record(z.string(), z.any())
      .describe('Region spec: region, networking {deploymentCIDR}'),
  }),
  execute: async ({ redisCredentials, subscriptionId, region }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/regions`,
        {
          method: 'POST',
          body: region,
        },
      );
      if (!result.ok) return failedResult('Failed to create subscription region', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error creating subscription region');
    }
  },
});

export const redisDeleteSubscriptionRegion = tool({
  description: 'Detach a region from a subscription.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: z.number().int().describe('Subscription ID'),
    regionId: z.string().describe('Region ID'),
  }),
  execute: async ({ redisCredentials, subscriptionId, regionId }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/regions/${regionId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete subscription region', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error deleting subscription region');
    }
  },
});

export const redisListTransitGateways = tool({
  description: 'List Transit Gateway attachments of a subscription (AWS).',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: z.number().int().describe('Subscription ID'),
  }),
  execute: async ({ redisCredentials, subscriptionId }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/transitGateways`,
      );
      if (!result.ok) return failedResult('Failed to list transit gateways', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error listing transit gateways');
    }
  },
});

export const redisListTransitGatewayInvitations = tool({
  description: 'List Transit Gateway RAM invitations of a subscription.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: z.number().int().describe('Subscription ID'),
  }),
  execute: async ({ redisCredentials, subscriptionId }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/transitGateways/invitations`,
      );
      if (!result.ok) return failedResult('Failed to list transit gateway invitations', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error listing transit gateway invitations');
    }
  },
});

export const redisAcceptTransitGatewayInvitation = tool({
  description: 'Accept a Transit Gateway RAM invitation.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: z.number().int().describe('Subscription ID'),
    invitationId: z.string().describe('Invitation ID'),
  }),
  execute: async ({ redisCredentials, subscriptionId, invitationId }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/transitGateways/invitations/${invitationId}/accept`,
        { method: 'PUT', body: {} },
      );
      if (!result.ok) return failedResult('Failed to accept transit gateway invitation', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error accepting transit gateway invitation');
    }
  },
});

export const redisRejectTransitGatewayInvitation = tool({
  description: 'Reject a Transit Gateway RAM invitation.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: z.number().int().describe('Subscription ID'),
    invitationId: z.string().describe('Invitation ID'),
  }),
  execute: async ({ redisCredentials, subscriptionId, invitationId }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/transitGateways/invitations/${invitationId}/reject`,
        { method: 'PUT', body: {} },
      );
      if (!result.ok) return failedResult('Failed to reject transit gateway invitation', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error rejecting transit gateway invitation');
    }
  },
});

export const redisCreateTransitGatewayAttachment = tool({
  description: 'Create a Transit Gateway attachment for a subscription region.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: z.number().int().describe('Subscription ID'),
    transitGatewayId: z.string().describe('Transit Gateway ID'),
    attachment: z
      .record(z.string(), z.any())
      .describe('Attachment spec: CIDRs, RAM resource share'),
  }),
  execute: async ({ redisCredentials, subscriptionId, transitGatewayId, attachment }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/transitGateways/${transitGatewayId}/attachment`,
        { method: 'POST', body: attachment },
      );
      if (!result.ok) return failedResult('Failed to create transit gateway attachment', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error creating transit gateway attachment');
    }
  },
});

export const redisUpdateTransitGatewayAttachment = tool({
  description: 'Update a Transit Gateway attachment.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: z.number().int().describe('Subscription ID'),
    transitGatewayId: z.string().describe('Transit Gateway ID'),
    attachment: z.record(z.string(), z.any()).describe('Attachment fields to update'),
  }),
  execute: async ({ redisCredentials, subscriptionId, transitGatewayId, attachment }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/transitGateways/${transitGatewayId}/attachment`,
        { method: 'PUT', body: attachment },
      );
      if (!result.ok) return failedResult('Failed to update transit gateway attachment', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error updating transit gateway attachment');
    }
  },
});

export const redisDeleteTransitGatewayAttachment = tool({
  description: 'Delete a Transit Gateway attachment.',
  inputSchema: z.object({
    redisCredentials: credentialsField,
    subscriptionId: z.number().int().describe('Subscription ID'),
    transitGatewayId: z.string().describe('Transit Gateway ID'),
  }),
  execute: async ({ redisCredentials, subscriptionId, transitGatewayId }) => {
    try {
      const result = await redisRequest(
        redisCredentials,
        `/subscriptions/${subscriptionId}/transitGateways/${transitGatewayId}/attachment`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete transit gateway attachment', result);
      return result.data;
    } catch (error) {
      return toRedisError(error, 'Error deleting transit gateway attachment');
    }
  },
});
