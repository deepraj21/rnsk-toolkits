// @ts-nocheck
import { batchExecute } from './batch-execute.js';
import { clearTasks } from './clear-tasks.js';
import { createTask } from './create-task.js';
import { createTaskList } from './create-task-list.js';
import { deleteTask } from './delete-task.js';
import { deleteTaskList } from './delete-task-list.js';
import { getTask } from './get-task.js';
import { getTaskList } from './get-task-list.js';
import { listAllTasks } from './list-all-tasks.js';
import { listTaskLists } from './list-task-lists.js';
import { listTasks } from './list-tasks.js';
import { moveTask } from './move-task.js';
import { updateTask } from './update-task.js';
import { updateTaskFull } from './update-task-full.js';
import { updateTaskList } from './update-task-list.js';

export {
    batchExecute,
    clearTasks,
    createTask,
    createTaskList,
    deleteTask,
    deleteTaskList,
    getTask,
    getTaskList,
    listAllTasks,
    listTaskLists,
    listTasks,
    moveTask,
    updateTask,
    updateTaskFull,
    updateTaskList,
};

export const googleTasksTools = [
    {
        name: 'googleTasksListTaskLists',
        description:
            'Lists all task lists owned by the authenticated user. Use to discover available task lists before reading or managing tasks.',
        tool: listTaskLists,
        requiredAuth: 'googleTasksToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleTasksGetTaskList',
        description:
            'Retrieves a single task list by ID, including its title, ID, and last-updated timestamp.',
        tool: getTaskList,
        requiredAuth: 'googleTasksToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleTasksCreateTaskList',
        description:
            'Creates a new task list with the given title. Use when the user wants a new list to organize tasks.',
        tool: createTaskList,
        requiredAuth: 'googleTasksToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'googleTasksUpdateTaskList',
        description: 'Renames an existing task list. Use PATCH semantics — only the title is updated.',
        tool: updateTaskList,
        requiredAuth: 'googleTasksToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'googleTasksDeleteTaskList',
        description:
            'Deletes a task list and all tasks it contains. Use only when the user explicitly asks to remove a list.',
        tool: deleteTaskList,
        requiredAuth: 'googleTasksToken' as const,
        scope: 'delete' as const,
    },
    {
        name: 'googleTasksListTasks',
        description:
            'Lists tasks in a task list with optional filters. Use to view open tasks, completed tasks, or tasks due within a range.',
        tool: listTasks,
        requiredAuth: 'googleTasksToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleTasksGetTask',
        description:
            'Retrieves a single task by ID, including title, notes, status, due date, and position.',
        tool: getTask,
        requiredAuth: 'googleTasksToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleTasksCreateTask',
        description:
            'Creates a new task in a task list. Use to add to-dos with optional notes, due date, subtask parent, or position.',
        tool: createTask,
        requiredAuth: 'googleTasksToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'googleTasksUpdateTask',
        description:
            'Updates a task title, notes, due date, or status. Use to rename, reschedule, complete, or reopen a task.',
        tool: updateTask,
        requiredAuth: 'googleTasksToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'googleTasksDeleteTask',
        description:
            'Deletes a task and all of its subtasks. Use only when the user explicitly asks to remove a task.',
        tool: deleteTask,
        requiredAuth: 'googleTasksToken' as const,
        scope: 'delete' as const,
    },
    {
        name: 'googleTasksMoveTask',
        description:
            'Moves a task to a new position, optionally under a different parent or to a different task list. Use to reorder tasks, convert a task into a subtask, or move across lists.',
        tool: moveTask,
        requiredAuth: 'googleTasksToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'googleTasksUpdateTaskFull',
        description:
            'Fully replaces a task via PUT (requires id and title). Use when you need to rewrite the entire task resource instead of patching individual fields.',
        tool: updateTaskFull,
        requiredAuth: 'googleTasksToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'googleTasksListAllTasks',
        description:
            'Lists all tasks across all task lists with optional filters. Use when you need a global view without knowing which list to query first.',
        tool: listAllTasks,
        requiredAuth: 'googleTasksToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleTasksBatchExecute',
        description:
            'Executes multiple Google Tasks API operations in a single tool call. Use for bulk updates, moves, or deletes to reduce tool invocations.',
        tool: batchExecute,
        requiredAuth: 'googleTasksToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'googleTasksClearTasks',
        description: 'Clears all completed tasks from a task list. Use to tidy up a list after tasks are done.',
        tool: clearTasks,
        requiredAuth: 'googleTasksToken' as const,
        scope: 'delete' as const,
    },
];
