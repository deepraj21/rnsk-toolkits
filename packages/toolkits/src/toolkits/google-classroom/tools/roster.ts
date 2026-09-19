// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { classroomRequest, googleClassroomTokenField } from './client.js';

export const addStudentToCourse = tool({
    description: 'Enrolls a user as a student. Admins enroll directly; others need the enrollment code.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string().describe('Course ID or alias'),
        userId: z.string().describe("User ID, email, or 'me'"),
        enrollmentCode: z.string().optional().describe('Required for self-enrollment'),
    }),
    execute: async ({ googleClassroomToken, courseId, userId, enrollmentCode }) => {
        try {
            const body: Record<string, unknown> = { userId };
            if (enrollmentCode) body.enrollmentCode = enrollmentCode;
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/students`, {
                method: 'POST',
                body,
            });
            if (!result.ok) return { error: 'Failed to add student', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error adding student', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const deleteCourseStudent = tool({
    description: 'Removes a student enrollment, revoking access to materials and participation.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string().describe('Course ID or alias'),
        userId: z.string().describe("Student ID, email, or 'me'"),
    }),
    execute: async ({ googleClassroomToken, courseId, userId }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/students/${userId}`, {
                method: 'DELETE',
            });
            if (!result.ok) return { error: 'Failed to delete student', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error deleting student', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const getCourseStudent = tool({
    description: 'Gets a student enrollment with profile and Drive folder details.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string().describe('Course ID or alias'),
        userId: z.string().describe("Student ID, email, or 'me'"),
    }),
    execute: async ({ googleClassroomToken, courseId, userId }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/students/${userId}`);
            if (!result.ok) return { error: 'Failed to get student', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error getting student', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listCourseStudents = tool({
    description: 'Pages through enrolled students in a course.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string().describe('Course ID or alias'),
        pageSize: z.number().min(1).max(100).optional(),
        pageToken: z.string().optional(),
    }),
    execute: async ({ googleClassroomToken, courseId, pageSize, pageToken }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/students`, {
                query: { pageSize, pageToken },
            });
            if (!result.ok) return { error: 'Failed to list students', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error listing students', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listStudentGuardians = tool({
    description: 'Lists guardians linked to a student in a course, with pagination.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string().describe('Course ID or alias'),
        studentId: z.string().describe("Student ID, email, or 'me'"),
        pageSize: z.number().min(1).max(100).optional(),
        pageToken: z.string().optional(),
    }),
    execute: async ({ googleClassroomToken, courseId, studentId, pageSize, pageToken }) => {
        try {
            const result = await classroomRequest(
                googleClassroomToken,
                `/courses/${courseId}/students/${studentId}/guardians`,
                { query: { pageSize, pageToken } },
            );
            if (!result.ok) return { error: 'Failed to list student guardians', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error listing student guardians', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const deleteCourseTeacher = tool({
    description: 'Removes a teacher enrollment, revoking teaching access. The course owner cannot be removed this way.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string().describe('Course ID or alias'),
        userId: z.string().describe("Teacher ID, email, or 'me'"),
    }),
    execute: async ({ googleClassroomToken, courseId, userId }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/teachers/${userId}`, {
                method: 'DELETE',
            });
            if (!result.ok) return { error: 'Failed to delete teacher', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error deleting teacher', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const getTeacher = tool({
    description: 'Gets a teacher enrollment with profile details.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string().describe('Course ID or alias'),
        userId: z.string().describe('Teacher ID or email'),
        fields: z.string().optional().describe('Partial-response field selector'),
        quotaUser: z.string().optional().describe('Quota attribution string (server-side apps)'),
    }),
    execute: async ({ googleClassroomToken, courseId, userId, fields, quotaUser }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/teachers/${userId}`, {
                query: { fields, quotaUser },
            });
            if (!result.ok) return { error: 'Failed to get teacher', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error getting teacher', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listCourseTeachers = tool({
    description: 'Pages through enrolled teachers in a course.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string(),
        pageSize: z.number().min(1).max(100).optional(),
        pageToken: z.string().optional(),
    }),
    execute: async ({ googleClassroomToken, courseId, pageSize, pageToken }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/teachers`, {
                query: { pageSize, pageToken },
            });
            if (!result.ok) return { error: 'Failed to list teachers', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error listing teachers', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
