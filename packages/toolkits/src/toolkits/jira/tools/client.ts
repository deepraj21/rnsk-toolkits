// @ts-nocheck
const ATLASSIAN_API = 'https://api.atlassian.com';

const cloudCache = new Map();

export async function getCloudId(token, hint) {
    if (hint) return hint;
    if (cloudCache.has(token)) return cloudCache.get(token);
    const response = await fetch(`${ATLASSIAN_API}/oauth/token/accessible-resources`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const sites = await response.json().catch(() => []);
    const id = Array.isArray(sites) && sites.length > 0 ? sites[0].id : null;
    if (id) cloudCache.set(token, id);
    return id;
}

function withQuery(url, query = {}) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null || value === '') continue;
        if (Array.isArray(value)) {
            if (value.length === 0) continue;
            params.append(key, value.join(','));
        } else {
            params.append(key, String(value));
        }
    }
    const qs = params.toString();
    return qs ? `${url}?${qs}` : url;
}

async function parseBody(response) {
    const text = await response.text();
    if (!text) return { success: true };
    try {
        return JSON.parse(text);
    } catch {
        return { raw: text };
    }
}

export async function jira(token, { cloudId, api = 'api/3', path, method = 'GET', query, body, headers = {} }) {
    if (!token) return { error: 'Jira token is required. Connect Jira first.' };
    const cid = await getCloudId(token, cloudId);
    if (!cid) return { error: 'Could not determine your Jira Cloud site. Reconnect Jira and try again.' };
    const url = withQuery(`${ATLASSIAN_API}/ex/jira/${cid}/rest/${api}${path}`, query);
    try {
        const response = await fetch(url, {
            method,
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json', ...headers },
            body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
        });
        if (!response.ok) {
            const details = await parseBody(response).catch(() => ({}));
            return { error: `Jira API request failed with status ${response.status}`, details };
        }
        if (response.status === 204) return { success: true };
        return await parseBody(response);
    } catch (error) {
        return { error: 'Error calling Jira API', message: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// --- Markdown subset to Atlassian Document Format ---

function inlineNodes(text) {
    const nodes = [];
    const pattern = /(\*\*.+?\*\*|__.+?__|\*[^*]+?\*|_[^_]+?_|`[^`]+?`|\[[^\]]+?\]\([^)]+?\))/g;
    let last = 0;
    let match;
    const pushText = (t) => {
        if (t) nodes.push({ type: 'text', text: t });
    };
    while ((match = pattern.exec(text)) !== null) {
        pushText(text.slice(last, match.index));
        const tok = match[0];
        if (tok.startsWith('**') || tok.startsWith('__')) {
            nodes.push({ type: 'text', text: tok.slice(2, -2), marks: [{ type: 'strong' }] });
        } else if (tok.startsWith('*') || tok.startsWith('_')) {
            nodes.push({ type: 'text', text: tok.slice(1, -1), marks: [{ type: 'em' }] });
        } else if (tok.startsWith('`')) {
            nodes.push({ type: 'text', text: tok.slice(1, -1), marks: [{ type: 'code' }] });
        } else {
            const m = /^\[([^\]]+?)\]\(([^)]+?)\)$/.exec(tok);
            if (m) nodes.push({ type: 'text', text: m[1], marks: [{ type: 'link', attrs: { href: m[2] } }] });
            else pushText(tok);
        }
        last = match.index + tok.length;
    }
    pushText(text.slice(last));
    return nodes.length > 0 ? nodes : [{ type: 'text', text }];
}

export function mdToAdf(input) {
    if (input === undefined || input === null) return undefined;
    if (typeof input !== 'string') return input;
    const lines = input.split('\n');
    const content = [];
    let i = 0;
    const para = (t) => ({ type: 'paragraph', content: inlineNodes(t) });
    while (i < lines.length) {
        const line = lines[i];
        if (/^\s*$/.test(line)) {
            i++;
            continue;
        }
        const fence = /^```(\w*)\s*$/.exec(line);
        if (fence) {
            const buf = [];
            i++;
            while (i < lines.length && !/^```\s*$/.test(lines[i])) buf.push(lines[i++]);
            i++;
            content.push({ type: 'codeBlock', attrs: fence[1] ? { language: fence[1] } : {}, content: [{ type: 'text', text: buf.join('\n') }] });
            continue;
        }
        const heading = /^(#{1,6})\s+(.*)$/.exec(line);
        if (heading) {
            content.push({ type: 'heading', attrs: { level: heading[1].length }, content: inlineNodes(heading[2]) });
            i++;
            continue;
        }
        const quote = /^>\s?(.*)$/.exec(line);
        if (quote) {
            const buf = [quote[1]];
            i++;
            while (i < lines.length && /^>\s?(.*)$/.test(lines[i])) buf.push(/^>\s?(.*)$/.exec(lines[i])[1]), i++;
            content.push({ type: 'blockquote', content: buf.map((t) => para(t)) });
            continue;
        }
        const bullet = /^\s*[-*+]\s+(.*)$/.exec(line);
        if (bullet) {
            const items = [];
            while (i < lines.length) {
                const m = /^\s*[-*+]\s+(.*)$/.exec(lines[i]);
                if (!m) break;
                items.push({ type: 'listItem', content: [para(m[1])] });
                i++;
            }
            content.push({ type: 'bulletList', content: items });
            continue;
        }
        const ordered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
        if (ordered) {
            const items = [];
            while (i < lines.length) {
                const m = /^\s*\d+[.)]\s+(.*)$/.exec(lines[i]);
                if (!m) break;
                items.push({ type: 'listItem', content: [para(m[1])] });
                i++;
            }
            content.push({ type: 'orderedList', content: items });
            continue;
        }
        content.push(para(line));
        i++;
    }
    return { type: 'doc', version: 1, content: content.length > 0 ? content : [para('')] };
}

// --- lookups ---

export async function findAccountId(token, cloudId, nameOrEmail) {
    if (!nameOrEmail) return null;
    const users = await jira(token, { cloudId, path: '/user/search', query: { query: nameOrEmail, maxResults: 5 } });
    if (!Array.isArray(users) || users.length === 0) return null;
    const human = users.find((u) => u.accountType !== 'app') ?? users[0];
    return human?.accountId ?? null;
}

export async function resolveAssignee(token, cloudId, accountId, nameOrEmail) {
    if (accountId) return accountId;
    if (!nameOrEmail) return undefined;
    return (await findAccountId(token, cloudId, nameOrEmail)) ?? undefined;
}

export async function getTransitionId(token, cloudId, issueIdOrKey, idOrName) {
    if (/^\d+$/.test(String(idOrName))) return String(idOrName);
    const data = await jira(token, { cloudId, path: `/issue/${encodeURIComponent(issueIdOrKey)}/transitions` });
    const list = data?.transitions ?? [];
    const hit = list.find((t) => t.name?.toLowerCase() === String(idOrName).toLowerCase());
    return hit ? String(hit.id) : null;
}

export async function uploadAttachment(token, cloudId, issueKey, { fileName, fileContent, mimeType }) {
    if (!token) return { error: 'Jira token is required. Connect Jira first.' };
    const cid = await getCloudId(token, cloudId);
    if (!cid) return { error: 'Could not determine your Jira Cloud site. Reconnect Jira and try again.' };
    try {
        const bytes = Buffer.from(fileContent, 'base64');
        const form = new FormData();
        form.append('file', new Blob([bytes], { type: mimeType ?? 'application/octet-stream' }), fileName);
        const response = await fetch(`${ATLASSIAN_API}/ex/jira/${cid}/rest/api/3/issue/${encodeURIComponent(issueKey)}/attachments`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'X-Atlassian-Token': 'no-check' },
            body: form,
        });
        if (!response.ok) {
            const details = await parseBody(response).catch(() => ({}));
            return { error: `Jira API request failed with status ${response.status}`, details };
        }
        return await parseBody(response);
    } catch (error) {
        return { error: 'Error uploading attachment to Jira', message: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// --- structured-filter search to JQL ---

function qv(value, numeric = false) {
    if (value === undefined || value === null) return null;
    if (numeric && /^-?\d+$/.test(String(value))) return String(value);
    return `"${String(value).replace(/"/g, '\\"')}"`;
}

export function buildSearchJql(f) {
    const clauses = [];
    if (f.projectKey) clauses.push(`project = ${qv(f.projectKey)}`);
    if (f.assignee) {
        if (f.assignee === 'unassigned') clauses.push('assignee is EMPTY');
        else clauses.push(`assignee = ${qv(f.assignee)}`);
    }
    if (f.statusIdOrName) clauses.push(`status = ${qv(f.statusIdOrName, true)}`);
    if (f.priorityIdOrName) clauses.push(`priority = ${qv(f.priorityIdOrName, true)}`);
    if (f.issueTypeIdOrName) clauses.push(`issuetype = ${qv(f.issueTypeIdOrName, true)}`);
    if (f.labels && f.labels.length > 0) clauses.push(`labels in (${f.labels.map((l) => qv(l)).join(', ')})`);
    if (f.textSearch) clauses.push(`text ~ ${qv(f.textSearch)}`);
    if (f.sprintIdOrName) clauses.push(`sprint = ${qv(f.sprintIdOrName, true)}`);
    const date = (field, v) => (v ? `${field} >= ${qv(v)}` : null);
    const dateBefore = (field, v) => (v ? `${field} <= ${qv(v)}` : null);
    for (const c of [date('created', f.createdAfter), date('updated', f.updatedAfter), dateBefore('created', f.createdBefore), dateBefore('updated', f.updatedBefore)]) {
        if (c) clauses.push(c);
    }
    let jql = clauses.join(' AND ');
    if (f.preservedOrderBy) jql += (jql ? ' ' : '') + f.preservedOrderBy;
    return jql;
}

export { ATLASSIAN_API };
