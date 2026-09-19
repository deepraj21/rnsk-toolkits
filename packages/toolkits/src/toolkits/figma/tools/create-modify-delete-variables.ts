// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

const changeSchema = z.record(z.any()).describe('Mutation object with action CREATE/UPDATE/DELETE plus relevant fields');

export const createModifyDeleteVariables = tool({
    description:
        'Batch creates, updates, or deletes variable collections, modes, variables, and mode values. Use temp IDs to link new items in one request; values must match resolvedType.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        fileKey: z.string().describe('File or branch key to modify variables in'),
        variableCollections: z.array(changeSchema).optional().describe('Collection mutations'),
        variableModes: z.array(changeSchema).optional().describe('Mode mutations (max 40 per collection)'),
        variables: z.array(changeSchema).optional().describe('Variable mutations (max 5000 per collection)'),
        variableModeValues: z.array(changeSchema).optional().describe('Value assignments {variableId, modeId, value}'),
    }),
    execute: async ({ figmaToken, fileKey, variableCollections, variableModes, variables, variableModeValues }) => {
        try {
            const body: Record<string, unknown> = {};
            if (variableCollections) body.variableCollections = variableCollections;
            if (variableModes) body.variableModes = variableModes;
            if (variables) body.variables = variables;
            if (variableModeValues) body.variableModeValues = variableModeValues;
            const result = await figmaRequest(figmaToken, `/v1/files/${fileKey}/variables`, {
                method: 'POST',
                body,
            });
            if (!result.ok) return { error: 'Failed to mutate variables', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error mutating variables',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
