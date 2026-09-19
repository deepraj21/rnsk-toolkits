// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { classroomRequest, googleClassroomTokenField } from './client.js';

const materialSchema = z.record(z.any()).describe('Material with exactly one of driveFile, link, form, youtubeVideo');

export const createCourseWorkMaterial = tool({
    description: 'Creates a coursework material (resources/notes) in a course, published, drafted, or scheduled.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        materials: z.array(materialSchema).optional(),
        state: z.enum(['DRAFT', 'PUBLISHED', 'DELETED']).optional(),
        scheduledTime: z.string().optional().describe('RFC3339 publish time'),
        topicId: z.string().optional(),
        assigneeMode: z.enum(['ALL_STUDENTS', 'INDIVIDUAL_STUDENTS']).optional(),
        individualStudentsOptions: z.object({ studentIds: z.array(z.string()) }).optional(),
        associatedWithDeveloper: z.boolean().optional(),
    }),
    execute: async ({ googleClassroomToken, courseId, ...body }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/courseWorkMaterials`, {
                method: 'POST',
                body,
            });
            if (!result.ok) return { error: 'Failed to create coursework material', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error creating coursework material', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const getCourseWorkMaterial = tool({
    description: 'Gets a coursework material by course and material ID.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string().describe('Course ID or alias'),
        id: z.string().describe('Material ID'),
    }),
    execute: async ({ googleClassroomToken, courseId, id }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/courseWorkMaterials/${id}`);
            if (!result.ok) return { error: 'Failed to get coursework material', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error getting coursework material', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listCourseWorkMaterials = tool({
    description: 'Pages through coursework materials in a course, newest or oldest first.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string(),
        orderBy: z.enum(['updateTime asc', 'updateTime desc']).optional(),
        pageSize: z.number().min(1).max(100).optional(),
        pageToken: z.string().optional(),
    }),
    execute: async ({ googleClassroomToken, courseId, orderBy, pageSize, pageToken }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/courseWorkMaterials`, {
                query: { orderBy, pageSize, pageToken },
            });
            if (!result.ok) return { error: 'Failed to list coursework materials', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error listing coursework materials', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const deleteCourseWorkMaterial = tool({
    description: 'Deletes a coursework material. Confirm course and material IDs first.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string().describe('Course ID or alias'),
        id: z.string().describe('Material ID to delete'),
    }),
    execute: async ({ googleClassroomToken, courseId, id }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/courseWorkMaterials/${id}`, {
                method: 'DELETE',
            });
            if (!result.ok) return { error: 'Failed to delete coursework material', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error deleting coursework material', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const patchCourseWorkMaterial = tool({
    description: 'Updates a coursework material. Only fields in updateMask change (title, description, state, scheduledTime, topicId).',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string().describe('Course ID or alias'),
        id: z.string().describe('Material ID to update'),
        updateMask: z.string().describe("Fields to update, e.g. 'title,description'"),
        title: z.string().max(3000).optional(),
        description: z.string().max(30000).optional(),
        state: z.enum(['DRAFT', 'PUBLISHED', 'DELETED']).optional(),
        scheduledTime: z.string().optional(),
        topicId: z.string().optional(),
    }),
    execute: async ({ googleClassroomToken, courseId, id, updateMask, ...fields }) => {
        try {
            const body: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(fields)) if (v !== undefined) body[k] = v;
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/courseWorkMaterials/${id}`, {
                method: 'PATCH',
                query: { updateMask },
                body,
            });
            if (!result.ok) return { error: 'Failed to patch coursework material', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error patching coursework material', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
