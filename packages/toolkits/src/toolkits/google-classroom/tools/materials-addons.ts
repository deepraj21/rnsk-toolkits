// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { classroomRequest, googleClassroomTokenField } from './client.js';

export const listCourseWorkMaterialAddOnAttachments = tool({
    description: 'Lists add-on attachments on a coursework material created by the add-on.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string(),
        itemId: z.string().describe('Coursework material ID'),
    }),
    execute: async ({ googleClassroomToken, courseId, itemId }) => {
        try {
            const result = await classroomRequest(
                googleClassroomToken,
                `/courses/${courseId}/courseWorkMaterials/${itemId}/addOnAttachments`,
            );
            if (!result.ok) return { error: 'Failed to list material add-on attachments', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error listing material add-on attachments', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const getCourseWorkMaterialAddOnContext = tool({
    description: 'Gets add-on iframe metadata for a coursework material: role context, submission ID, grade support.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string(),
        itemId: z.string().describe('Coursework material ID with the attached add-on'),
        addOnToken: z.string().optional(),
        attachmentId: z.string().optional().describe('Required except for Attachment Discovery iframe'),
    }),
    execute: async ({ googleClassroomToken, courseId, itemId, addOnToken, attachmentId }) => {
        try {
            const result = await classroomRequest(
                googleClassroomToken,
                `/courses/${courseId}/courseWorkMaterials/${itemId}/addOnContext`,
                { query: { addOnToken, attachmentId } },
            );
            if (!result.ok) return { error: 'Failed to get material add-on context', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error getting material add-on context', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
