// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { classroomRequest, googleClassroomTokenField } from './client.js';

export const createCourseTopic = tool({
    description: 'Creates a named topic section to organize course content.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string(),
        name: z.string().describe('Topic name, e.g. Homework'),
    }),
    execute: async ({ googleClassroomToken, courseId, name }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/topics`, {
                method: 'POST',
                body: { name },
            });
            if (!result.ok) return { error: 'Failed to create topic', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error creating topic', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const deleteCourseTopic = tool({
    description: 'Deletes a topic. Confirm course and topic IDs first.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string(),
        id: z.string().describe('Topic ID to delete'),
    }),
    execute: async ({ googleClassroomToken, courseId, id }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/topics/${id}`, {
                method: 'DELETE',
            });
            if (!result.ok) return { error: 'Failed to delete topic', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error deleting topic', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const getCourseTopic = tool({
    description: 'Gets a topic by course and topic ID.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string().describe('Course ID or alias'),
        id: z.string().describe('Topic ID'),
    }),
    execute: async ({ googleClassroomToken, courseId, id }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/topics/${id}`);
            if (!result.ok) return { error: 'Failed to get topic', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error getting topic', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listCourseTopics = tool({
    description: 'Lists topics in a course with pagination.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string().describe('Course ID or alias'),
        pageSize: z.number().min(0).optional(),
        pageToken: z.string().optional(),
    }),
    execute: async ({ googleClassroomToken, courseId, pageSize, pageToken }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/topics`, {
                query: { pageSize, pageToken },
            });
            if (!result.ok) return { error: 'Failed to list topics', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error listing topics', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const patchCourseTopic = tool({
    description: "Renames a topic. Currently only 'name' is updatable via updateMask.",
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string(),
        id: z.string().describe('Topic ID'),
        name: z.string().optional().describe('New topic name'),
        updateMask: z.string().optional().describe("Fields to update, e.g. 'name'"),
    }),
    execute: async ({ googleClassroomToken, courseId, id, name, updateMask }) => {
        try {
            const body: Record<string, unknown> = {};
            if (name !== undefined) body.name = name;
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/topics/${id}`, {
                method: 'PATCH',
                query: { updateMask: updateMask ?? 'name' },
                body,
            });
            if (!result.ok) return { error: 'Failed to patch topic', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error patching topic', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
