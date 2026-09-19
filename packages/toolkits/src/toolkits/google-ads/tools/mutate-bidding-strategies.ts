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
    'BiddingStrategy operation: {create: {name, plus one scheme (target_cpa/target_roas/target_spend/maximize_conversions/maximize_conversion_value/target_impression_share)}}, {update: {...}, update_mask?}, or {remove: resourceName}. Snake_case keys accepted.',
);

export const mutateBiddingStrategies = tool({
    description:
        'Creates, updates, or removes portfolio bidding strategies (Target CPA/ROAS/Spend, Maximize Conversions/Conversion Value, Target Impression Share).',
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
            const result = await adsMutate(googleAdsToken, developerToken, 'biddingStrategies', {
                customerId,
                loginCustomerId,
                operations,
                validateOnly,
                partialFailure,
                responseContentType,
            });
            if (!result.ok) return { error: 'Failed to mutate bidding strategies', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error mutating bidding strategies',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
