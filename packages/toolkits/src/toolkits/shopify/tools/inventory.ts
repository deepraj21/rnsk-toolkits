// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { shopifyRequest, failedResult, toShopifyError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const shopifyListInventoryLevels = tool({
  description:
    'List inventory levels for inventory items at locations (GET /inventory_levels.json).',
  inputSchema: z.object({
    shopifyCredentials: credField,
    inventoryItemIds: z
      .string()
      .optional()
      .describe('Comma-separated inventory_item_id values (max 50)'),
    locationIds: z.string().optional().describe('Comma-separated location_id values'),
    limit: z.number().int().max(250).optional(),
    updatedAtMin: z.string().optional().describe('ISO 8601'),
  }),
  execute: async ({ shopifyCredentials, inventoryItemIds, locationIds, limit, updatedAtMin }) => {
    try {
      const result = await shopifyRequest(shopifyCredentials, '/inventory_levels.json', {
        query: {
          inventory_item_ids: inventoryItemIds,
          location_ids: locationIds,
          limit,
          updated_at_min: updatedAtMin,
        },
      });
      if (!result.ok) return failedResult('Failed to list inventory levels', result);
      return result.data;
    } catch (error) {
      return toShopifyError(error, 'Error listing inventory levels');
    }
  },
});

export const shopifyAdjustInventoryLevel = tool({
  description:
    'Adjust available quantity at a location (POST /inventory_levels/adjust.json). Use negative availableAdjustment to decrement stock.',
  inputSchema: z.object({
    shopifyCredentials: credField,
    inventoryItemId: z.number().int(),
    locationId: z.number().int(),
    availableAdjustment: z.number().int().describe('Delta to apply to available quantity'),
  }),
  execute: async ({ shopifyCredentials, inventoryItemId, locationId, availableAdjustment }) => {
    try {
      const result = await shopifyRequest(shopifyCredentials, '/inventory_levels/adjust.json', {
        method: 'POST',
        body: {
          location_id: locationId,
          inventory_item_id: inventoryItemId,
          available_adjustment: availableAdjustment,
        },
      });
      if (!result.ok) return failedResult('Failed to adjust inventory level', result);
      return result.data;
    } catch (error) {
      return toShopifyError(error, 'Error adjusting inventory level');
    }
  },
});
