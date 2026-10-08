// @ts-nocheck
// Twilio REST API — https://www.twilio.com/docs/usage/api
// Auth: HTTP Basic (Account SID + Auth Token)

export interface TwilioCredentials {
  accountSid: string;
  authToken: string;
}

export interface TwilioResponse {
  ok: boolean;
  status: number;
  data: unknown;
}

export const TWILIO_CONNECT_ERROR =
  'Twilio credentials are required. Connect with JSON {"accountSid":"AC...","authToken":"..."} from Console > Account > API keys & tokens.';

export function parseTwilioCredentials(twilioCredentials: string | undefined): TwilioCredentials {
  if (!twilioCredentials) {
    throw new Error(TWILIO_CONNECT_ERROR);
  }
  let parsed: Partial<TwilioCredentials>;
  try {
    parsed = JSON.parse(twilioCredentials);
  } catch {
    throw new Error(
      'Twilio credentials must be valid JSON like {"accountSid":"ACxxxxxxxx","authToken":"..."}',
    );
  }
  if (!parsed.accountSid || !parsed.authToken) {
    throw new Error('Twilio credentials must include accountSid and authToken');
  }
  return {
    accountSid: String(parsed.accountSid).trim(),
    authToken: String(parsed.authToken).trim(),
  };
}

function basicAuthHeader(credentials: TwilioCredentials): string {
  return `Basic ${Buffer.from(`${credentials.accountSid}:${credentials.authToken}`, 'utf-8').toString('base64')}`;
}

function appendQuery(url: URL, query?: Record<string, unknown>) {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    url.searchParams.set(key, String(value));
  }
}

export async function twilioRequest(
  twilioCredentials: string | undefined,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    body?: Record<string, string | number | boolean | undefined>;
    baseHost?: string;
    formEncoded?: boolean;
  },
): Promise<TwilioResponse> {
  let credentials: TwilioCredentials;
  try {
    credentials = parseTwilioCredentials(twilioCredentials);
  } catch (error) {
    return {
      ok: false,
      status: 401,
      data: { error: error instanceof Error ? error.message : TWILIO_CONNECT_ERROR },
    };
  }
  const host = (options?.baseHost ?? 'https://api.twilio.com').replace(/\/+$/, '');
  const url = new URL(`${host}${path.startsWith('/') ? path : `/${path}`}`);
  appendQuery(url, options?.query);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: basicAuthHeader(credentials),
  };
  const method = options?.method ?? 'GET';
  const fetchOptions: RequestInit = { method, headers };

  if (options?.body !== undefined) {
    if (options.formEncoded !== false) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(options.body)) {
        if (value === undefined) continue;
        params.set(key, String(value));
      }
      fetchOptions.body = params.toString();
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    } else {
      fetchOptions.body = JSON.stringify(options.body);
      headers['Content-Type'] = 'application/json';
    }
  }

  try {
    const response = await fetch(url.toString(), fetchOptions);
    const raw = await response.text();
    let data: unknown = null;
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = raw;
      }
    }
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      data: { error: error instanceof Error ? error.message : 'Twilio request failed' },
    };
  }
}

export function accountPath(credentials: TwilioCredentials, suffix: string): string {
  return `/2010-04-01/Accounts/${credentials.accountSid}${suffix}`;
}

export function failedResult(action: string, result: TwilioResponse) {
  return { error: action, statusCode: result.status, details: result.data };
}

export function toTwilioError(error: unknown, action: string) {
  return { error: action, message: error instanceof Error ? error.message : 'Unknown error' };
}
