// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const tokenField = z.string().optional().describe('Injected by system; do not provide');

function resolveConfigDir(opts: {
    preferXdg?: boolean;
    platformHint?: string;
    xdgConfigHomeOverride?: string;
    overrideKaggleConfigDir?: string;
}): string {
    if (opts.overrideKaggleConfigDir) return opts.overrideKaggleConfigDir;
    if (process.env.KAGGLE_CONFIG_DIR) return process.env.KAGGLE_CONFIG_DIR;
    const platform = opts.platformHint === 'windows' ? 'win32' : opts.platformHint === 'posix' ? 'linux' : process.platform;
    if (platform === 'win32') {
        const appData = process.env.APPDATA;
        if (appData) return path.join(appData, 'kaggle');
        return path.join(os.homedir(), '.kaggle');
    }
    if (opts.preferXdg) {
        const base = opts.xdgConfigHomeOverride ?? process.env.XDG_CONFIG_HOME ?? path.join(os.homedir(), '.config');
        return path.join(base, 'kaggle');
    }
    const legacy = path.join(os.homedir(), '.kaggle');
    try {
        if (fs.existsSync(legacy)) return legacy;
    } catch {}
    return path.join(os.homedir(), '.config', 'kaggle');
}

function configFilePath(dir: string): string {
    return path.join(dir, 'kaggle.json');
}

function readJsonFile(filePath: string): Record<string, any> {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
        return {};
    }
}

export const kaggleConfigDir = tool({
    description: "Tool to retrieve the directory of the Kaggle API configuration file. Use when you need to locate the directory containing your kaggle.json credentials.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        preferXdg: z.boolean().optional().describe("Prefer XDG config home path on POSIX"),
        platformHint: z.string().optional().describe("Force platform branch: 'windows' or 'posix'. If not set, auto-detect."),
        useFallbackOnly: z.boolean().optional().describe("Skip CLI, compute directory using environment/platform defaults."),
        xdgConfigHomeOverride: z.string().optional().describe("Override XDG_CONFIG_HOME base directory for fallback computation."),
        overrideKaggleConfigDir: z.string().optional().describe("Override directory to use as Kaggle config directory"),
    }),
    execute: async ({ kaggleCredentials, preferXdg, platformHint, useFallbackOnly, xdgConfigHomeOverride, overrideKaggleConfigDir }) => {
        try {
            if (!useFallbackOnly) {
                try {
                    const { stdout } = await execFileAsync('kaggle', ['config', 'path'], { timeout: 15000 });
                    const cliPath = stdout.trim();
                    if (cliPath) return { config_dir: path.dirname(cliPath) };
                } catch {}
            }
            return {
                config_dir: resolveConfigDir({ preferXdg, platformHint, xdgConfigHomeOverride, overrideKaggleConfigDir }),
            };
        } catch (error) {
            return { error: 'Error resolving Kaggle config directory', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const kaggleConfigInit = tool({
    description: "Initialize Kaggle API client configuration. This action sets up the necessary configuration file for Kaggle API access by first attempting to use the Kaggle CLI's 'kaggle config init' command. If the CLI is unavailable, it falls back to creating a kaggle.json file at ~/.kaggle/kaggle.json (or $KAGGLE_CONFIG_DIR/kaggle.json if that environment variable is set). The action is idempotent - if configuration already exists, it will not overwrite it. No parameters are required; the action uses environment variables and metadata when available. Run this before other Kaggle actions when credentials are missing or when KAGGLE_CONFIG_VIEW returns empty/error output.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
    }),
    execute: async ({ kaggleCredentials }) => {
        try {
            try {
                const { stdout } = await execFileAsync('kaggle', ['config', 'init'], { timeout: 30000 });
                return { success: true, output: stdout.trim() || 'Kaggle config initialized via CLI' };
            } catch {}
            const dir = resolveConfigDir({});
            const filePath = configFilePath(dir);
            if (fs.existsSync(filePath)) {
                return { success: true, output: `Kaggle config already exists at ${filePath}, left unchanged` };
            }
            fs.mkdirSync(dir, { recursive: true });
            const data: Record<string, string> = {};
            if (process.env.KAGGLE_USERNAME) data.username = process.env.KAGGLE_USERNAME;
            if (process.env.KAGGLE_KEY) data.key = process.env.KAGGLE_KEY;
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), { mode: 0o600 });
            return { success: true, output: `Kaggle config created at ${filePath}` };
        } catch (error) {
            return { error: 'Error initializing Kaggle config', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const kaggleConfigKeys = tool({
    description: "Tool to list local Kaggle API configuration keys. Use when you need to see which configuration options are set without revealing values.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
    }),
    execute: async ({ kaggleCredentials }) => {
        try {
            const keys: string[] = [];
            const data = readJsonFile(configFilePath(resolveConfigDir({})));
            for (const key of Object.keys(data)) keys.push(key);
            return { keys };
        } catch (error) {
            return { error: 'Error listing Kaggle config keys', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const kaggleConfigPath = tool({
    description: "Tool to retrieve local Kaggle API configuration file path. Use when you need to know the location of the Kaggle config before operations.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        preferXdg: z.boolean().optional().describe("Prefer XDG config home path on POSIX"),
        platformHint: z.string().optional().describe("Force platform branch: 'windows' or 'posix'. If not set, auto-detect."),
        useFallbackOnly: z.boolean().optional().describe("Skip CLI, compute path using environment/platform defaults."),
        xdgConfigHomeOverride: z.string().optional().describe("Override XDG_CONFIG_HOME base directory for fallback computation."),
        overrideKaggleConfigDir: z.string().optional().describe("Override directory to use for kaggle.json"),
    }),
    execute: async ({ kaggleCredentials, preferXdg, platformHint, useFallbackOnly, xdgConfigHomeOverride, overrideKaggleConfigDir }) => {
        try {
            if (!useFallbackOnly) {
                try {
                    const { stdout } = await execFileAsync('kaggle', ['config', 'path'], { timeout: 15000 });
                    const cliPath = stdout.trim();
                    if (cliPath) return { config_path: cliPath };
                } catch {}
            }
            return {
                config_path: configFilePath(
                    resolveConfigDir({ preferXdg, platformHint, xdgConfigHomeOverride, overrideKaggleConfigDir }),
                ),
            };
        } catch (error) {
            return { error: 'Error resolving Kaggle config path', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const kaggleConfigReset = tool({
    description: "Tool to reset local Kaggle CLI configuration to defaults. Clears CLI-managed keys ('competition', 'path', 'proxy').",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
    }),
    execute: async ({ kaggleCredentials }) => {
        try {
            const filePath = configFilePath(resolveConfigDir({}));
            const data = readJsonFile(filePath);
            for (const key of ['competition', 'path', 'proxy']) delete data[key];
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            return { success: true, message: 'Kaggle config reset to defaults' };
        } catch (error) {
            return { error: 'Error resetting Kaggle config', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const kaggleConfigSet = tool({
    description: "Tool to set a Kaggle CLI configuration parameter. Use when updating local CLI settings such as default download path or proxy. Ensure Kaggle CLI is installed.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        name: z.enum(["competition", "path", "proxy"]).describe("Configuration parameter to set. Must be one of 'competition', 'path', or 'proxy'."),
        value: z.string().describe("Value to assign to the configuration parameter."),
    }),
    execute: async ({ kaggleCredentials, name, value }) => {
        try {
            try {
                await execFileAsync('kaggle', ['config', 'set', '-n', name, '-v', value], { timeout: 30000 });
                return { name, value };
            } catch {}
            const filePath = configFilePath(resolveConfigDir({}));
            const data = readJsonFile(filePath);
            data[name] = value;
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            return { name, value };
        } catch (error) {
            return { error: 'Error setting Kaggle config', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const kaggleConfigUnset = tool({
    description: "Tool to unset a Kaggle CLI configuration parameter. Use when removing local CLI settings such as default download path or proxy. Ensure Kaggle CLI is installed.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        name: z.enum(["competition", "path", "proxy"]).describe("Configuration parameter to unset. Must be one of 'competition', 'path', or 'proxy'."),
    }),
    execute: async ({ kaggleCredentials, name }) => {
        try {
            try {
                await execFileAsync('kaggle', ['config', 'unset', '-n', name], { timeout: 30000 });
                return { name };
            } catch {}
            const filePath = configFilePath(resolveConfigDir({}));
            const data = readJsonFile(filePath);
            delete data[name];
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            return { name };
        } catch (error) {
            return { error: 'Error unsetting Kaggle config', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const kaggleConfigView = tool({
    description: "View local Kaggle API credentials and configuration settings. This action reads Kaggle configuration from local sources (does NOT make API calls to Kaggle). Configuration is retrieved in the following precedence order: 1. kaggle.json file (from KAGGLE_CONFIG_DIR env var, ~/.config/kaggle/, or ~/.kaggle/) 2. 'kaggle config view' CLI output (for proxy/path settings) 3. Environment variables (KAGGLE_USERNAME, KAGGLE_KEY) 4. Authorization header from metadata Use this action to: - Verify Kaggle credentials are configured before making API calls - Check current proxy settings - Debug authentication issues Returns empty strings for username/key if no credentials are found; use KAGGLE_CONFIG_INIT to set up credentials first. Note: username and key are independent — an empty username field does not indicate missing or invalid credentials. WARNING: This action returns sensitive API key data in plain text.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
    }),
    execute: async ({ kaggleCredentials }) => {
        try {
            let username = process.env.KAGGLE_USERNAME ?? '';
            let key = process.env.KAGGLE_KEY ?? '';
            let proxy: string | null = null;
            const data = readJsonFile(configFilePath(resolveConfigDir({})));
            if (data.username) username = data.username;
            if (data.key) key = data.key;
            if (data.proxy) proxy = data.proxy;
            try {
                const { stdout } = await execFileAsync('kaggle', ['config', 'view'], { timeout: 15000 });
                const match = stdout.match(/proxy\s*[:=]\s*(\S+)/i);
                if (match) proxy = match[1];
            } catch {}
            return { username, key, proxy };
        } catch (error) {
            return { error: 'Error viewing Kaggle config', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
