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
    'CampaignLabel operation: {create: {campaign, label}} or {remove: customers/{id}/campaignLabels/{campaignId}~{labelId}}. Snake_case keys accepted.',
);

export const mutateCampaignLabels = tool({
    description:
        'Creates or removes relationships between campaigns and labels. Use after creating labels to organize campaigns for filtering and reporting.',
    inputSchema: z.object({
        googleAdsToken: googleAdsTokenField,
        developerToken: developerTokenField,
        operations: z.array(operationSchema).min(1),
        validateOnly: z.boolean().optional().describe('Validate without applying changes'),
        partialFailure: z.boolean().optional().describe('Valid ops succeed even if others fail'),
        customerId: customerIdField,
        loginCustomerId: loginCustomerIdField,
    }),
    execute: async ({ googleAdsToken, developerToken, operations, validateOnly, partialFailure, customerId, loginCustomerId }) => {
        try {
            const result = await adsMutate(googleAdsToken, developerToken, 'campaignLabels', {
                customerId,
                loginCustomerId,
                operations,
                validateOnly,
                partialFailure,
            });
            if (!result.ok) return { error: 'Failed to mutate campaign labels', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error mutating campaign labels',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
