// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { crowdstrikeRequest, failedResult, toCrowdstrikeError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const crowdstrikeQueryDevices = tool({
  description:
    'Search host IDs using FQL filter (GET /devices/queries/devices/v1). Returns resource IDs to pass to GetDeviceDetails.',
  inputSchema: z.object({
    crowdstrikeCredentials: credField,
    filter: z.string().optional().describe("FQL filter, e.g. hostname:'WORKSTATION*'"),
    limit: z.number().int().optional(),
    offset: z.string().optional(),
    sort: z.string().optional(),
  }),
  execute: async ({ crowdstrikeCredentials, filter, limit, offset, sort }) => {
    try {
      const result = await crowdstrikeRequest(
        crowdstrikeCredentials,
        '/devices/queries/devices/v1',
        { query: { filter, limit, offset, sort } },
      );
      if (!result.ok) return failedResult('Failed to query devices', result);
      return result.data;
    } catch (error) {
      return toCrowdstrikeError(error, 'Error querying devices');
    }
  },
});

export const crowdstrikeGetDevices = tool({
  description: 'Get host details for one or more device IDs (POST /devices/entities/devices/v2).',
  inputSchema: z.object({
    crowdstrikeCredentials: credField,
    ids: z.array(z.string()).min(1).describe('Device IDs from query_devices'),
  }),
  execute: async ({ crowdstrikeCredentials, ids }) => {
    try {
      const result = await crowdstrikeRequest(
        crowdstrikeCredentials,
        '/devices/entities/devices/v2',
        { method: 'POST', body: { ids } },
      );
      if (!result.ok) return failedResult('Failed to get devices', result);
      return result.data;
    } catch (error) {
      return toCrowdstrikeError(error, 'Error getting devices');
    }
  },
});

export const crowdstrikeCombinedDevices = tool({
  description:
    'Search hosts with combined device details in one call (GET /devices/combined/devices/v1).',
  inputSchema: z.object({
    crowdstrikeCredentials: credField,
    filter: z.string().optional().describe('FQL filter'),
    limit: z.number().int().optional(),
    offset: z.number().int().optional(),
    sort: z.string().optional(),
  }),
  execute: async ({ crowdstrikeCredentials, filter, limit, offset, sort }) => {
    try {
      const result = await crowdstrikeRequest(
        crowdstrikeCredentials,
        '/devices/combined/devices/v1',
        { query: { filter, limit, offset, sort } },
      );
      if (!result.ok) return failedResult('Failed to list combined devices', result);
      return result.data;
    } catch (error) {
      return toCrowdstrikeError(error, 'Error listing combined devices');
    }
  },
});

export const crowdstrikeGetDeviceOnlineState = tool({
  description: 'Get online state for device IDs (POST /devices/entities/online-state/v1).',
  inputSchema: z.object({
    crowdstrikeCredentials: credField,
    ids: z.array(z.string()).min(1).describe('Device IDs'),
  }),
  execute: async ({ crowdstrikeCredentials, ids }) => {
    try {
      const result = await crowdstrikeRequest(
        crowdstrikeCredentials,
        '/devices/entities/online-state/v1',
        { method: 'POST', body: { ids } },
      );
      if (!result.ok) return failedResult('Failed to get device online state', result);
      return result.data;
    } catch (error) {
      return toCrowdstrikeError(error, 'Error getting device online state');
    }
  },
});

export const crowdstrikeContainDevices = tool({
  description:
    'Network-contain hosts by device ID (POST /devices/entities/devices-actions/v2?action_name=contain). Requires Hosts: WRITE.',
  inputSchema: z.object({
    crowdstrikeCredentials: credField,
    ids: z.array(z.string()).min(1).describe('Device IDs to contain'),
  }),
  execute: async ({ crowdstrikeCredentials, ids }) => {
    try {
      const result = await crowdstrikeRequest(
        crowdstrikeCredentials,
        '/devices/entities/devices-actions/v2',
        {
          method: 'POST',
          query: { action_name: 'contain' },
          body: { ids },
        },
      );
      if (!result.ok) return failedResult('Failed to contain devices', result);
      return result.data;
    } catch (error) {
      return toCrowdstrikeError(error, 'Error containing devices');
    }
  },
});

export const crowdstrikeLiftContainment = tool({
  description:
    'Lift network containment for hosts (POST .../devices-actions/v2?action_name=lift_containment).',
  inputSchema: z.object({
    crowdstrikeCredentials: credField,
    ids: z.array(z.string()).min(1).describe('Device IDs'),
  }),
  execute: async ({ crowdstrikeCredentials, ids }) => {
    try {
      const result = await crowdstrikeRequest(
        crowdstrikeCredentials,
        '/devices/entities/devices-actions/v2',
        {
          method: 'POST',
          query: { action_name: 'lift_containment' },
          body: { ids },
        },
      );
      if (!result.ok) return failedResult('Failed to lift containment', result);
      return result.data;
    } catch (error) {
      return toCrowdstrikeError(error, 'Error lifting containment');
    }
  },
});
