// @ts-nocheck
import { createHmac } from 'node:crypto';

const EXCHANGE_BASE_URL = 'https://api.exchange.coinbase.com';
const INTX_BASE_URL = 'https://api.international.coinbase.com';
const ADV_BASE_URL = 'https://api.coinbase.com/api/v3/brokerage';
const V2_BASE_URL = 'https://api.coinbase.com/v2';

export class CoinbaseApiError extends Error {
  status: number;
  details: unknown;
  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export interface CoinbaseCredentials {
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
}

export function parseCoinbaseCredentials(raw: string | undefined): CoinbaseCredentials {
  if (!raw) {
    throw new Error('Coinbase API credentials are required. Connect Coinbase first.');
  }
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Coinbase credentials are malformed. Reconnect Coinbase.');
  }
  const apiKey = parsed?.apiKey ?? parsed?.api_key ?? parsed?.key;
  const apiSecret = parsed?.apiSecret ?? parsed?.api_secret ?? parsed?.secret;
  const passphrase = parsed?.passphrase;
  if (!apiKey || !apiSecret) {
    throw new Error(
      'Coinbase credentials must include apiKey and apiSecret. Reconnect Coinbase with a full API key.',
    );
  }
  return {
    apiKey: String(apiKey),
    apiSecret: String(apiSecret),
    passphrase: passphrase === undefined ? undefined : String(passphrase),
  };
}

type QueryValue = string | number | boolean | undefined;
export type Query = Record<string, QueryValue | QueryValue[]>;

function appendQuery(url: URL, query?: Query) {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined) url.searchParams.append(key, String(item));
      }
    } else {
      url.searchParams.set(key, String(value));
    }
  }
}

async function readJson(response: Response): Promise<any> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function toErrorData(data: any): unknown {
  if (data && typeof data === 'object' && 'message' in data) return (data as any).message;
  return data;
}

export async function publicGet(base: string, path: string, query?: Query): Promise<any> {
  const url = new URL(base + path);
  appendQuery(url, query);
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  const data = await readJson(response);
  if (!response.ok) {
    throw new CoinbaseApiError('Coinbase API request failed', response.status, toErrorData(data));
  }
  return data;
}

export function exchangeGet(path: string, query?: Query): Promise<any> {
  return publicGet(EXCHANGE_BASE_URL, path, query);
}

export function intxGet(path: string, query?: Query): Promise<any> {
  return publicGet(INTX_BASE_URL, path, query);
}

export function advGet(path: string, query?: Query): Promise<any> {
  return publicGet(ADV_BASE_URL, path, query);
}

function signCoinbaseRequest(
  secretBase64: string,
  timestamp: string,
  method: string,
  requestPath: string,
  body = '',
): string {
  const key = Buffer.from(secretBase64, 'base64');
  if (key.length === 0) {
    throw new Error('Coinbase apiSecret must be a base64-encoded secret.');
  }
  return createHmac('sha256', key)
    .update(timestamp + method + requestPath + body)
    .digest('base64');
}

async function signedGet(
  base: string,
  path: string,
  query: Query | undefined,
  creds: CoinbaseCredentials,
  opts: { passphraseRequired: boolean },
): Promise<any> {
  const url = new URL(base + path);
  appendQuery(url, query);
  const requestPath = url.pathname + url.search;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  if (opts.passphraseRequired && !creds.passphrase) {
    throw new Error(
      'Coinbase passphrase is required for this endpoint. Reconnect Coinbase with API key, secret, and passphrase.',
    );
  }
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'CB-ACCESS-KEY': creds.apiKey,
    'CB-ACCESS-SIGN': signCoinbaseRequest(creds.apiSecret, timestamp, 'GET', requestPath),
    'CB-ACCESS-TIMESTAMP': timestamp,
  };
  if (creds.passphrase) headers['CB-ACCESS-PASSPHRASE'] = creds.passphrase;
  const response = await fetch(url.toString(), { method: 'GET', headers });
  const data = await readJson(response);
  if (!response.ok) {
    throw new CoinbaseApiError('Coinbase API request failed', response.status, toErrorData(data));
  }
  return data;
}

/** Signed GET against Coinbase Exchange (api.exchange.coinbase.com). Requires key + secret + passphrase. */
export async function exchangeSignedGet(
  coinbaseCredentials: string | undefined,
  path: string,
  query?: Query,
): Promise<any> {
  return signedGet(EXCHANGE_BASE_URL, path, query, parseCoinbaseCredentials(coinbaseCredentials), {
    passphraseRequired: true,
  });
}

/** Signed GET against Coinbase retail v2 API (api.coinbase.com/v2). Requires key + secret. */
export async function v2SignedGet(
  coinbaseCredentials: string | undefined,
  path: string,
  query?: Query,
): Promise<any> {
  return signedGet(V2_BASE_URL, path, query, parseCoinbaseCredentials(coinbaseCredentials), {
    passphraseRequired: false,
  });
}

export function toCoinbaseError(error: unknown, label: string) {
  if ((error as any)?.details !== undefined) {
    return { error: label, details: (error as any).details };
  }
  return {
    error: label.replace('Failed', 'Error').replace('failed', 'error'),
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}

export function missingCredentials() {
  return { error: 'Coinbase API credentials are required. Connect Coinbase first.' };
}
