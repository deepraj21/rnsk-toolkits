// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { classroomRequest, googleClassroomTokenField } from './client.js';

export const createCourseAlias = tool({
    description: 'Adds an alternative identifier to a course. d: aliases need domain admin; p: aliases any project user.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string().describe('Course ID or existing alias'),
        alias: z.string().max(256).describe("Alias to create, e.g. 'p:history301' or 'd:school_math'"),
    }),
    execute: async ({ googleClassroomToken, courseId, alias }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/aliases`, {
                method: 'POST',
                body: { alias },
            });
            if (!result.ok) return { error: 'Failed to create course alias', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error creating course alias', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const deleteCourseAlias = tool({
    description: 'Removes an alias from a course. Confirm course ID and alias name first.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string().describe('Course ID or alias'),
        alias: z.string().describe('Alias to delete (not the Classroom-assigned ID)'),
    }),
    execute: async ({ googleClassroomToken, courseId, alias }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/aliases/${alias}`, {
                method: 'DELETE',
            });
            if (!result.ok) return { error: 'Failed to delete course alias', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error deleting course alias', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listCourseAliases = tool({
    description: 'Lists all aliases for a course with pagination.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string().describe('Course ID or alias'),
        pageSize: z.number().optional(),
        pageToken: z.string().optional(),
    }),
    execute: async ({ googleClassroomToken, courseId, pageSize, pageToken }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/aliases`, {
                query: { pageSize, pageToken },
            });
            if (!result.ok) return { error: 'Failed to list course aliases', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error listing course aliases', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
