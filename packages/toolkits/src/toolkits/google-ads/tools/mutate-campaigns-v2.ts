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

const campaignPayload = z.record(z.any()).describe(
    'Campaign fields with typed bidding: name, status, campaign_budget (required for create), advertising_channel_type (search/display), manual_cpc/target_cpa/target_roas/target_spend/maximize_conversions/maximize_conversion_value/target_impression_share, bidding_strategy, network_settings, dates, tracking. Snake_case keys accepted.',
);

const operationSchema = z.object({
    operationType: z.enum(['create', 'update', 'remove']).describe('Type of operation'),
    create: campaignPayload.optional(),
    update: campaignPayload.optional(),
    remove: z.string().optional().describe('Campaign resource name to remove (irreversible)'),
    updateMask: z.string().optional().describe('Optional comma-separated update field paths (explicit paths take precedence)'),
});

export const mutateCampaignsV2 = tool({
    description:
        'Creates, updates, or removes search/display campaigns in batch with typed standard bidding strategies. Removes are irreversible; use validateOnly to test first.',
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
            const normalized = operations.map((op) => {
                if (op.operationType === 'create') return { create: op.create };
                if (op.operationType === 'update') {
                    const entry: Record<string, unknown> = { update: op.update };
                    if (op.updateMask) entry.updateMask = op.updateMask;
                    return entry;
                }
                return { remove: op.remove };
            });
            const result = await adsMutate(googleAdsToken, developerToken, 'campaigns', {
                customerId,
                loginCustomerId,
                operations: normalized as Array<Record<string, unknown>>,
                validateOnly,
                partialFailure,
                responseContentType,
            });
            if (!result.ok) return { error: 'Failed to mutate campaigns', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error mutating campaigns',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
