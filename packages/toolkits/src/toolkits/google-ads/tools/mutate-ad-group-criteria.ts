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
    'AdGroupCriterion operation with exactly one of create (ad_group plus keyword/audience/demographic/placement/topic/webpage/listing_group payload), update (resource_name plus fields), or remove (resource name, irreversible). Snake_case keys accepted.',
);

export const mutateAdGroupCriteria = tool({
    description:
        'Creates, updates, or removes ad group criteria (keywords, audiences, demographics, placements, topics, webpages, listing groups). Removes are irreversible; use validateOnly to dry-run.',
    inputSchema: z.object({
        googleAdsToken: googleAdsTokenField,
        developerToken: developerTokenField,
        operations: z.array(operationSchema).min(1).max(5000),
        validateOnly: z.boolean().optional().describe('Validate without applying changes'),
        partialFailure: z.boolean().optional().describe('Valid ops succeed even if others fail (atomic otherwise)'),
        responseContentType: z.enum(['UNSPECIFIED', 'RESOURCE_NAME_ONLY', 'MUTABLE_RESOURCE']).optional().describe('How much of each mutated resource to return'),
        customerId: customerIdField,
        loginCustomerId: loginCustomerIdField,
    }),
    execute: async ({ googleAdsToken, developerToken, operations, validateOnly, partialFailure, responseContentType, customerId, loginCustomerId }) => {
        try {
            const result = await adsMutate(googleAdsToken, developerToken, 'adGroupCriteria', {
                customerId,
                loginCustomerId,
                operations,
                validateOnly,
                partialFailure,
                responseContentType,
            });
            if (!result.ok) return { error: 'Failed to mutate ad group criteria', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error mutating ad group criteria',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
