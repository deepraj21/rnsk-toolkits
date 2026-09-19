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
    'Portfolio strategy operation: {create: {name, target_cpa?/target_roas? (+ floors/ceilings), currency_code? (create-only, manager accounts)}}, {update: {resource_name, ...}}, {remove: resourceName}, update_mask?. Transition all campaigns before removal. Snake_case keys accepted.',
);

export const mutatePortfolioBiddingStrategies = tool({
    description:
        'Creates, edits, or removes typed Target CPA / Target ROAS portfolio strategies. Attach with mutateCampaigns, read with getRmfReport, and transition all campaigns before removal.',
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
            if (!result.ok) {
                return { error: 'Failed to mutate portfolio bidding strategies', details: result.error };
            }
            return result.data;
        } catch (error) {
            return {
                error: 'Error mutating portfolio bidding strategies',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
