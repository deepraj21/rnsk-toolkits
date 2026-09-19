// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { classroomRequest, googleClassroomTokenField } from './client.js';

const courseState = z.enum(['COURSE_STATE_UNSPECIFIED', 'ACTIVE', 'ARCHIVED', 'PROVISIONED', 'DECLINED']);

export const createCourse = tool({
    description: 'Creates a course. Use when a teacher needs a Classroom course before enrollment.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        name: z.string().max(750).describe('Course name (required)'),
        ownerId: z.string().describe('Owner user ID or email (required)'),
        descriptionHeading: z.string().max(360).optional(),
        description: z.string().max(30000).optional(),
        room: z.string().max(64).optional(),
        section: z.string().max(2800).optional(),
        courseState: courseState.optional().describe('Initial state'),
    }),
    execute: async ({ googleClassroomToken, ...body }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, '/courses', { method: 'POST', body });
            if (!result.ok) return { error: 'Failed to create course', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error creating course', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const deleteCourse = tool({
    description: 'Deletes a course. Confirm the course ID first; deletion removes access for all members.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        id: z.string().describe('Course ID or alias to delete'),
    }),
    execute: async ({ googleClassroomToken, id }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${id}`, { method: 'DELETE' });
            if (!result.ok) return { error: 'Failed to delete course', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error deleting course', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const getCourse = tool({
    description: 'Gets full details for a course by ID or alias.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        id: z.string().describe('Course ID or alias'),
    }),
    execute: async ({ googleClassroomToken, id }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${id}`);
            if (!result.ok) return { error: 'Failed to get course', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error getting course', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listCourses = tool({
    description: 'Lists courses visible to you, with optional student/teacher/state filters and pagination.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        studentId: z.string().optional().describe("Filter to courses with this student ('me' or ID)"),
        teacherId: z.string().optional().describe("Filter to courses taught by this teacher ('me' or ID)"),
        courseStates: z.array(courseState).optional(),
        pageSize: z.number().min(1).optional(),
        pageToken: z.string().optional(),
    }),
    execute: async ({ googleClassroomToken, studentId, teacherId, courseStates, pageSize, pageToken }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, '/courses', {
                query: { studentId, teacherId, courseStates, pageSize, pageToken },
            });
            if (!result.ok) return { error: 'Failed to list courses', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error listing courses', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const patchCourse = tool({
    description: 'Partially updates a course. Only fields in updateMask change (e.g. name,section).',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        id: z.string().describe('Course ID or alias to update'),
        updateMask: z.string().describe("Comma-separated fields, e.g. 'name,section'"),
        name: z.string().optional(),
        descriptionHeading: z.string().optional(),
        description: z.string().optional(),
        room: z.string().optional(),
        section: z.string().optional(),
        courseState: courseState.optional(),
        ownerId: z.string().optional().describe('New owner user ID'),
    }),
    execute: async ({ googleClassroomToken, id, updateMask, ...fields }) => {
        try {
            const body: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(fields)) if (v !== undefined) body[k] = v;
            const result = await classroomRequest(googleClassroomToken, `/courses/${id}`, {
                method: 'PATCH',
                query: { updateMask },
                body,
            });
            if (!result.ok) return { error: 'Failed to patch course', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error patching course', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const updateCourse = tool({
    description: 'Fully replaces a course (PUT). Requires id, name, and ownerId; other fields optional.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        id: z.string().describe('Course ID or alias to update'),
        name: z.string().max(750),
        ownerId: z.string().describe('Owner user ID or email (admins only to change)'),
        descriptionHeading: z.string().optional(),
        description: z.string().max(30000).optional(),
        room: z.string().max(650).optional(),
        section: z.string().max(2800).optional(),
        courseState: courseState.optional(),
    }),
    execute: async ({ googleClassroomToken, id, ...body }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${id}`, { method: 'PUT', body });
            if (!result.ok) return { error: 'Failed to update course', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error updating course', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const getGradingPeriodSettings = tool({
    description: 'Gets grading periods configured for a course.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string().describe('Course ID or alias'),
    }),
    execute: async ({ googleClassroomToken, courseId }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/gradingPeriodSettings`);
            if (!result.ok) return { error: 'Failed to get grading period settings', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error getting grading period settings', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listCourseStudentGroups = tool({
    description: 'Lists student groups in a course with pagination.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string().describe('Course ID or alias'),
        pageSize: z.number().min(0).optional(),
        pageToken: z.string().optional(),
    }),
    execute: async ({ googleClassroomToken, courseId, pageSize, pageToken }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/studentGroups`, {
                query: { pageSize, pageToken },
            });
            if (!result.ok) return { error: 'Failed to list student groups', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error listing student groups', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
