// @ts-nocheck
import { jira, mdToAdf, resolveAssignee } from './client.js';

function isNumericId(v) {
    return v !== undefined && v !== null && /^\d+$/.test(String(v));
}

function looksLikeAccountId(v) {
    return typeof v === 'string' && (/^[0-9a-f]{24}$/.test(v) || v.includes(':'));
}

export async function buildCreateFields(token, cloudId, s) {
    const fields = {};
    fields.project = { key: s.projectKey };
    fields.summary = s.summary;
    const it = s.issueType ?? s.issue_type ?? 'Task';
    fields.issuetype = isNumericId(it) ? { id: String(it) } : { name: String(it) };
    if (s.description !== undefined) fields.description = mdToAdf(s.description);
    if (s.environment !== undefined) fields.environment = mdToAdf(s.environment);
    const acc = await resolveAssignee(token, cloudId, s.assignee, s.assigneeName ?? s.assignee_name);
    if (acc) fields.assignee = { accountId: acc };
    if (s.reporter) fields.reporter = { accountId: s.reporter };
    if (s.priority) fields.priority = isNumericId(s.priority) ? { id: String(s.priority) } : { name: String(s.priority) };
    if (s.labels) fields.labels = s.labels;
    if (s.components) fields.components = s.components.map((c) => ({ id: String(c) }));
    if (s.versions) fields.versions = s.versions.map((v) => ({ id: String(v) }));
    if (s.fixVersions) fields.fixVersions = s.fixVersions.map((v) => ({ id: String(v) }));
    if (s.dueDate) fields.duedate = s.dueDate;
    const parent = s.parent ?? s.parentKey ?? s.parentId ?? s.parent_key ?? s.parent_id;
    if (parent) fields.parent = { key: String(parent) };
    const extra = s.additionalProperties ?? s.additional_properties;
    if (extra) {
        const obj = typeof extra === 'string' ? JSON.parse(extra) : extra;
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
            delete obj.resolution;
            Object.assign(fields, obj);
        }
    }
    return { fields, sprintId: s.sprintId };
}

export async function createOneIssue(token, cloudId, spec) {
    const { fields, sprintId } = await buildCreateFields(token, cloudId, spec);
    const res = await jira(token, { cloudId, path: '/issue', method: 'POST', body: { fields } });
    if (res?.error) return { error: res };
    if (sprintId && /^\d+$/.test(String(sprintId)) && res?.key) {
        await jira(token, {
            cloudId,
            api: 'agile/1.0',
            path: `/sprint/${sprintId}/issue`,
            method: 'POST',
            body: { issues: [res.key] },
        });
    }
    return res;
}

export async function buildEditBody(token, cloudId, o) {
    const fields = {};
    if (o.fields) {
        try {
            const parsed = typeof o.fields === 'string' ? JSON.parse(o.fields) : o.fields;
            if (parsed && typeof parsed === 'object') Object.assign(fields, parsed);
        } catch { /* ignore malformed JSON; direct params still apply */ }
    }
    if (o.additionalProperties && typeof o.additionalProperties === 'object') {
        Object.assign(fields, o.additionalProperties);
    }
    if (o.summary !== undefined) fields.summary = o.summary;
    if (o.description !== undefined) fields.description = mdToAdf(o.description);
    if (o.labels !== undefined) fields.labels = o.labels;
    if (o.dueDate !== undefined) fields.duedate = o.dueDate;
    if (o.priorityIdOrName !== undefined) {
        fields.priority = isNumericId(o.priorityIdOrName) ? { id: String(o.priorityIdOrName) } : { name: String(o.priorityIdOrName) };
    }
    if (o.assignee !== undefined) {
        if (o.assignee === null || o.assignee === '') {
            fields.assignee = null;
        } else if (looksLikeAccountId(o.assignee)) {
            fields.assignee = { accountId: o.assignee };
        } else {
            const acc = await resolveAssignee(token, cloudId, undefined, o.assignee);
            if (acc) fields.assignee = { accountId: acc };
        }
    }
    let update;
    if (o.update) {
        try {
            update = typeof o.update === 'string' ? JSON.parse(o.update) : o.update;
        } catch { /* ignore */ }
    }
    return { fields, update };
}
