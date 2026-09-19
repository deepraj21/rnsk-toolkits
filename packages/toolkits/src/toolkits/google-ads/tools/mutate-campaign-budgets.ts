// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
    adsMutate,
    customerIdField,
    developerTokenField,
    googleAdsTokenField,
    loginCustomerIdField,
} from './client.js';

const operationSchema = z.record(z.any()).describe(
    'CampaignBudget operation: {create: {name, amount_micros/total_amount_micros, delivery_method, explicitly_shared, period, type}}, {update: {...}, update_mask?}, or {remove: resourceName}. Create budgets before campaigns. Snake_case keys accepted.',
);

export const mutateCampaignBudgets = tool({
    description:
        'Creates, updates, or removes campaign budgets. Use before creating campaigns — campaign creation requires an existing campaign_budget resource name.',
    inputSchema: z.object({
        googleAdsToken: googleAdsTokenField,
        developerToken: developerTokenField,
        operations: z.array(operationSchema).min(1),
        validateOnly: z.boolean().optional().describe('Validate without applying changes'),
        partialFailure: z.boolean().optional().describe('Valid ops succeed even if others fail'),
        responseContentType: z.enum(['RESOURCE_NAME_ONLY', 'MUTABLE_RESOURCE']).optional().describe('How much of each mutated resource to return'),
        customerId: customerIdField,
        loginCustomerId: loginCustomerIdField,
    }),
    execute: async ({ googleAdsToken, developerToken, operations, validateOnly, partialFailure, responseContentType, customerId, loginCustomerId }) => {
        try {
            const result = await adsMutate(googleAdsToken, developerToken, 'campaignBudgets', {
                customerId,
                loginCustomerId,
                operations,
                validateOnly,
                partialFailure,
                responseContentType,
            });
            if (!result.ok) return { error: 'Failed to mutate campaign budgets', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error mutating campaign budgets',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
