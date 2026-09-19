// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { classroomRequest, googleClassroomTokenField } from './client.js';

const workType = z.enum(['ASSIGNMENT', 'SHORT_ANSWER_QUESTION', 'MULTIPLE_CHOICE_QUESTION']);
const dueDate = z.object({
    year: z.number().min(1),
    month: z.number().min(1).max(12),
    day: z.number().min(1).max(31),
});
const dueTime = z.object({
    hours: z.number().min(0).max(23),
    minutes: z.number().min(0).max(59),
    seconds: z.number().min(0).max(59).optional(),
    nanos: z.number().min(0).optional(),
});
const materialSchema = z.record(z.any()).describe('Material with exactly one of driveFile, link, form, youtubeVideo');
const assigneeMode = z.enum(['ALL_STUDENTS', 'INDIVIDUAL_STUDENTS']);

export const createCourseWork = tool({
    description: 'Creates coursework (assignment or question), published, drafted, or scheduled.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string(),
        title: z.string().describe('Coursework title (required)'),
        workType: workType,
        description: z.string().optional(),
        materials: z.array(materialSchema).optional(),
        state: z.enum(['DRAFT', 'PUBLISHED']).optional().describe('Defaults to PUBLISHED'),
        maxPoints: z.number().min(0).optional(),
        dueDate: dueDate.optional(),
        dueTime: dueTime.optional(),
        scheduledTime: z.string().optional().describe('RFC3339 auto-publish time'),
        topicId: z.string().optional(),
        assignment: z.record(z.any()).optional().describe('Details when workType is ASSIGNMENT'),
        multipleChoiceQuestion: z.object({ choices: z.array(z.string()).min(2) }).optional(),
        shortAnswerQuestion: z.record(z.any()).optional(),
        submissionModificationMode: z.enum(['SUBMISSION_MODIFICATION_MODE_UNSPECIFIED', 'MODIFIABLE_UNTIL_TURNED_IN', 'MODIFIABLE']).optional(),
    }),
    execute: async ({ googleClassroomToken, courseId, ...body }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/courseWork`, {
                method: 'POST',
                body,
            });
            if (!result.ok) return { error: 'Failed to create coursework', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error creating coursework', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const deleteCourseWork = tool({
    description: 'Deletes coursework. Confirm course and coursework IDs first.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string(),
        id: z.string().describe('Coursework ID to delete'),
    }),
    execute: async ({ googleClassroomToken, courseId, id }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/courseWork/${id}`, {
                method: 'DELETE',
            });
            if (!result.ok) return { error: 'Failed to delete coursework', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error deleting coursework', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const getCourseWork = tool({
    description: 'Gets coursework details by course and coursework ID.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string().describe('Course ID or alias'),
        id: z.string().describe('Coursework ID'),
    }),
    execute: async ({ googleClassroomToken, courseId, id }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/courseWork/${id}`);
            if (!result.ok) return { error: 'Failed to get coursework', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error getting coursework', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listCourseWork = tool({
    description: 'Lists coursework in a course with state filter and ordering. Defaults to PUBLISHED, newest first.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string().describe('Course ID or alias'),
        courseWorkStates: z.array(z.enum(['COURSE_WORK_STATE_UNSPECIFIED', 'DRAFT', 'PUBLISHED', 'DELETED'])).optional(),
        orderBy: z.string().optional().describe("e.g. 'updateTime desc', 'dueDate asc'"),
        pageSize: z.number().min(0).optional(),
        pageToken: z.string().optional(),
        previewVersion: z.string().optional(),
    }),
    execute: async ({ googleClassroomToken, courseId, ...query }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/courseWork`, { query });
            if (!result.ok) return { error: 'Failed to list coursework', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error listing coursework', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const patchCourseWork = tool({
    description: 'Updates coursework fields. Only fields in updateMask change (title, dueDate, maxPoints, ...).',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string().describe('Course ID or alias'),
        id: z.string().describe('Coursework ID to update'),
        updateMask: z.string().describe("Fields to update, e.g. 'title,maxPoints'"),
        title: z.string().max(3000).optional(),
        description: z.string().max(30000).optional(),
        materials: z.array(materialSchema).max(20).optional(),
        state: z.enum(['DRAFT', 'PUBLISHED', 'DELETED']).optional(),
        maxPoints: z.number().min(0).optional(),
        dueDate: dueDate.optional(),
        dueTime: dueTime.optional(),
        scheduledTime: z.string().optional(),
        topicId: z.string().optional(),
        gradingPeriodId: z.string().optional(),
        assigneeMode: assigneeMode.optional(),
        individualStudentsOptions: z.object({ studentIds: z.array(z.string()) }).optional(),
        submissionModificationMode: z.string().optional(),
    }),
    execute: async ({ googleClassroomToken, courseId, id, updateMask, ...fields }) => {
        try {
            const body: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(fields)) if (v !== undefined) body[k] = v;
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/courseWork/${id}`, {
                method: 'PATCH',
                query: { updateMask },
                body,
            });
            if (!result.ok) return { error: 'Failed to patch coursework', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error patching coursework', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const modifyCourseWorkAssignees = tool({
    description: 'Changes coursework visibility: all students or add/remove individual students.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string().describe('Course ID or alias'),
        id: z.string().describe('Coursework ID'),
        assigneeMode: assigneeMode,
        modifyIndividualStudentsOptions: z.object({
            addStudentIds: z.array(z.string()).optional(),
            removeStudentIds: z.array(z.string()).optional(),
        }).optional(),
    }),
    execute: async ({ googleClassroomToken, courseId, id, ...body }) => {
        try {
            const result = await classroomRequest(
                googleClassroomToken,
                `/courses/${courseId}/courseWork/${id}:modifyAssignees`,
                { method: 'POST', body },
            );
            if (!result.ok) return { error: 'Failed to modify coursework assignees', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error modifying coursework assignees', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listCourseWorkRubrics = tool({
    description: 'Lists grading rubrics for coursework you may view. At most 1 rubric is returned.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string().describe('Course ID or alias'),
        courseWorkId: z.string().describe('Coursework ID'),
        pageSize: z.number().min(1).optional().describe('Max items (default and max 1)'),
        pageToken: z.string().optional(),
        previewVersion: z.string().optional(),
    }),
    execute: async ({ googleClassroomToken, courseId, courseWorkId, pageSize, pageToken, previewVersion }) => {
        try {
            const result = await classroomRequest(
                googleClassroomToken,
                `/courses/${courseId}/courseWork/${courseWorkId}/rubrics`,
                { query: { pageSize, pageToken, previewVersion } },
            );
            if (!result.ok) return { error: 'Failed to list coursework rubrics', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error listing coursework rubrics', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listStudentSubmissions = tool({
    description: 'Lists submissions for coursework, filterable by student, state, and lateness. Use courseWorkId "-" for all coursework.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string(),
        courseWorkId: z.string().describe("Coursework ID, or '-' for all coursework"),
        userId: z.string().optional().describe("Filter to a student ('me' or ID)"),
        states: z.array(z.enum(['NEW', 'CREATED', 'TURNED_IN', 'RETURNED', 'RECLAIMED_BY_STUDENT'])).optional(),
        late: z.enum(['LATE_ONLY', 'NOT_LATE_ONLY']).optional(),
        pageSize: z.number().min(1).max(100).optional(),
        pageToken: z.string().optional(),
    }),
    execute: async ({ googleClassroomToken, courseId, courseWorkId, ...query }) => {
        try {
            const result = await classroomRequest(
                googleClassroomToken,
                `/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions`,
                { query },
            );
            if (!result.ok) return { error: 'Failed to list student submissions', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error listing student submissions', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const reclaimStudentSubmission = tool({
    description: 'Reclaims a turned-in submission for editing, resetting it to CREATED.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string(),
        courseWorkId: z.string(),
        id: z.string().describe('Submission ID to reclaim'),
    }),
    execute: async ({ googleClassroomToken, courseId, courseWorkId, id }) => {
        try {
            const result = await classroomRequest(
                googleClassroomToken,
                `/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions/${id}/reclaim`,
                { method: 'POST', body: {} },
            );
            if (!result.ok) return { error: 'Failed to reclaim student submission', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error reclaiming student submission', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
