# Agent skills for rnsk-toolkits

Reusable [Agent Skills](https://agentskills.io) instructions for AI coding agents working on this repo.

## Available skills

| Skill | Purpose |
|-------|---------|
| [add-rnsk-toolkit](./add-rnsk-toolkit/SKILL.md) | Add a new toolkit or tools to `@rnsk/toolkits` |

## Install (skills.sh / Skills CLI)

Skills appear on [skills.sh](https://skills.sh) after installs via the Vercel Skills CLI. There is no separate publish step — push to GitHub, then install:

```bash
# List skills in this repo
npx skills add deepraj21/rnsk-toolkits --list

# Install for Cursor (project scope)
npx skills add deepraj21/rnsk-toolkits --skill add-rnsk-toolkit -a cursor -y

# Install globally for all projects
npx skills add deepraj21/rnsk-toolkits --skill add-rnsk-toolkit -g -a cursor -y
```

Direct path:

```bash
npx skills add https://github.com/deepraj21/rnsk-toolkits/tree/main/skills/add-rnsk-toolkit
```

Use without installing:

```bash
npx skills use deepraj21/rnsk-toolkits@add-rnsk-toolkit
```

## Cursor project skill (alternative)

This repo also ships the skill under `skills/` for CLI discovery. Cursor loads project skills from `.cursor/skills/` when symlinked by the CLI into `~/.cursor/skills/` (global) or `.agents/skills/` (project).

## Contributing a new skill

1. Create `skills/<skill-name>/SKILL.md` with YAML frontmatter (`name` must match directory)
2. Keep `SKILL.md` under ~500 lines; put details in `references/`
3. Document install command in this README
4. Open a PR

Spec: [Agent Skills specification](https://github.com/agentskills/agentskills/blob/main/docs/specification.mdx)
