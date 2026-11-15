// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { anthropicUpload, fileBlob } from './client.js';

const MIME_TYPES = {
  md: 'text/markdown',
  markdown: 'text/markdown',
  txt: 'text/plain',
  json: 'application/json',
  yaml: 'text/yaml',
  yml: 'text/yaml',
  py: 'text/x-python',
  js: 'text/javascript',
  ts: 'text/typescript',
  sh: 'text/x-shellscript',
  html: 'text/html',
  csv: 'text/csv',
};

function mimeFor(filename) {
  const extension = String(filename).split('.').pop()?.toLowerCase() ?? '';
  return MIME_TYPES[extension] ?? 'text/plain';
}

export const anthropicCreateSkill = tool({
  description:
    'Creates a Claude Skill from a set of files. The files MUST include a SKILL.md at the root — that file’s frontmatter carries the skill name and instructions. Each file is { path, content }; the path defines the directory layout the skill runs from (e.g. "SKILL.md", "scripts/run.py").',
  inputSchema: z.object({
    anthropicApiKey: z.string().optional().describe('Anthropic API key (injected by system)'),
    files: z
      .array(
        z.object({
          path: z.string().describe('Relative path, e.g. "SKILL.md" or "scripts/run.py"'),
          content: z.string().describe('File contents (plain text)'),
          encoding: z
            .enum(['utf8', 'base64'])
            .optional()
            .describe('How to interpret content (default utf8)'),
        }),
      )
      .min(1)
      .describe('Skill files; must include a SKILL.md at the root'),
    displayName: z
      .string()
      .max(255)
      .optional()
      .describe('Human-readable label (derived from SKILL.md frontmatter when omitted)'),
    skillId: z.string().optional().describe('Optional explicit skill ID'),
  }),
  execute: async ({ anthropicApiKey, files, displayName, skillId }) => {
    if (!Array.isArray(files) || files.length === 0) {
      return { error: 'files must be a non-empty array of { path, content }.' };
    }

    const hasSkillMd = files.some(
      (file) =>
        String(file.path ?? '')
          .split('/')
          .pop() === 'SKILL.md',
    );
    if (!hasSkillMd) {
      return { error: 'files must include a SKILL.md at the root.' };
    }

    const form = new FormData();
    for (const file of files) {
      const path = String(file.path ?? '');
      if (!path) continue;
      form.append('files[]', fileBlob(file.content ?? '', file.encoding, mimeFor(path)), path);
    }
    if (displayName) form.append('display_name', String(displayName));
    if (skillId) form.append('skill_id', String(skillId));

    const result = await anthropicUpload(anthropicApiKey, '/v1/skills', form);
    if (result.error) return result;

    return result.data;
  },
});
