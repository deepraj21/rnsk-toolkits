// @ts-nocheck

export class NasaApiError extends Error {
  status: number;
  details: unknown;
  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function enc(value: string | number): string {
  return encodeURIComponent(String(value));
}

export function appendQuery(url: URL, query?: Record<string, unknown>) {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    url.searchParams.set(key, String(value));
  }
}

async function parseBody(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type') ?? '';
  const text = await response.text();
  if (text) {
    try {
      return JSON.parse(text);
    } catch {
      // not JSON below
    }
  } else {
    return {};
  }
  if (contentType.includes('xml') || text.trimStart().startsWith('<')) {
    return { xml: text };
  }
  return { raw: text };
}

export async function nasaGet(base: string, path: string, options?: { query?: Record<string, unknown> }): Promise<any> {
  const url = new URL(`${base}${path}`);
  appendQuery(url, options?.query);
  const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  const data = await parseBody(response);
  if (!response.ok) {
    throw new NasaApiError('NASA API request failed', response.status, data);
  }
  return data;
}

export async function nasaGetText(
  base: string,
  path: string,
  options?: { query?: Record<string, unknown> },
): Promise<{ format: string; content: string }> {
  const url = new URL(`${base}${path}`);
  appendQuery(url, options?.query);
  const response = await fetch(url.toString());
  const text = await response.text();
  if (!response.ok) {
    throw new NasaApiError('NASA API request failed', response.status, { raw: text.slice(0, 2000) });
  }
  return { format: 'text', content: text };
}

export async function nasaPost(base: string, path: string, body: unknown): Promise<any> {
  const response = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await parseBody(response);
  if (!response.ok) {
    throw new NasaApiError('NASA API request failed', response.status, data);
  }
  return data;
}

export async function nasaDownloadMeta(
  base: string,
  path: string,
  headers?: Record<string, string>,
): Promise<{ name: string; mimetype: string | null; sizeBytes: number | null; url: string; note: string }> {
  const url = `${base}${path}`;
  const response = await fetch(url, { method: 'HEAD', headers });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new NasaApiError('NASA API request failed', response.status, { raw: body.slice(0, 2000) });
  }
  const length = response.headers.get('content-length');
  return {
    name: path.split('/').pop() ?? 'download',
    mimetype: response.headers.get('content-type'),
    sizeBytes: length ? Number(length) : null,
    url,
    note: 'Binary content is not embedded in tool output. Use the url to download the file directly.',
  };
}

export function toNasaError(error: unknown, label: string) {
  if (error instanceof NasaApiError) {
    return { error: label, details: error.details, statusCode: error.status };
  }
  return {
    error: label.replace('Failed', 'Error').replace('failed', 'error'),
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}

export function requireApiKey(nasaApiKey: string | undefined) {
  if (!nasaApiKey) {
    return { error: 'NASA API key is required. Connect NASA first.' };
  }
  return null;
}

// ---------- Exoplanet TAP ----------

const EXO_TABLES: Record<string, string> = {
  cumulative: 'CUMULATIVE',
  exoplanets: 'ps',
  ps: 'ps',
  koi: 'Q1_Q17_DR25_KOI',
  compositepars: 'pscomppars',
};

export async function tapSync(options: {
  table: string;
  where?: string;
  select?: string;
  order?: string;
  format?: string;
}): Promise<any> {
  const mapped = EXO_TABLES[options.table] ?? options.table;
  const format = (options.format ?? 'json').toLowerCase();
  let adql = `select ${options.select || '*'} from ${mapped}`;
  if (options.where) adql += ` where ${options.where}`;
  if (options.order) adql += ` order by ${options.order}`;
  const url = new URL('https://exoplanetarchive.ipac.caltech.edu/TAP/sync');
  url.searchParams.set('query', adql);
  url.searchParams.set('format', format);
  const response = await fetch(url.toString());
  const text = await response.text();
  if (!response.ok) {
    throw new NasaApiError('NASA API request failed', response.status, { raw: text.slice(0, 2000) });
  }
  if (format === 'json') {
    try {
      const data = JSON.parse(text);
      return { format, recordCount: Array.isArray(data) ? data.length : undefined, data };
    } catch {
      return { format, data: text };
    }
  }
  return { format, data: text };
}

// ---------- EONET format converters (API only serves JSON) ----------

function escapeXml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function convertEonet(data: any, format: 'atom' | 'rss' | 'geojson'): any {
  const events = Array.isArray(data?.events) ? data.events : [];
  if (format === 'geojson') {
    return {
      type: 'FeatureCollection',
      features: events.flatMap((e: any) =>
        (e.geometry ?? []).map((g: any) => ({
          type: 'Feature',
          geometry: { type: g.type, coordinates: g.coordinates },
          properties: {
            id: e.id,
            title: e.title,
            description: e.description,
            link: e.link,
            closed: e.closed,
            categories: e.categories,
            sources: e.sources,
            date: g.date,
            magnitudeValue: g.magnitudeValue,
            magnitudeUnit: g.magnitudeUnit,
          },
        })),
      ),
    };
  }
  const items = events
    .map(
      (e: any) => `  <entry>\n    <title>${escapeXml(e.title)}</title>\n    <id>${escapeXml(e.id)}</id>\n    <link href="${escapeXml(e.link)}"/>\n    <summary>${escapeXml(e.description ?? '')}</summary>\n  </entry>`,
    )
    .join('\n');
  if (format === 'atom') {
    return {
      format: 'atom',
      xml: `<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n  <title>${escapeXml(data?.title ?? 'EONET Events')}</title>\n${items}\n</feed>`,
    };
  }
  const rssItems = events
    .map(
      (e: any) => `  <item>\n    <title>${escapeXml(e.title)}</title>\n    <guid>${escapeXml(e.id)}</guid>\n    <link>${escapeXml(e.link)}</link>\n    <description>${escapeXml(e.description ?? '')}</description>\n  </item>`,
    )
    .join('\n');
  return {
    format: 'rss',
    xml: `<?xml version="1.0" encoding="utf-8"?>\n<rss version="2.0" xmlns:georss="http://www.georss.org/georss">\n<channel>\n  <title>${escapeXml(data?.title ?? 'EONET Events')}</title>\n${rssItems}\n</channel>\n</rss>`,
  };
}

// ---------- SSC (Satellite Situation Center) ----------

const SSC_NS = 'http://sscweb.gsfc.nasa.gov/schema';

function xmlEscape(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const SSC_COORDS: Record<string, string> = {
  geo: 'Geo', gm: 'Gm', gse: 'Gse', gsm: 'Gsm', sm: 'Sm',
  gei_tod: 'GeiTod', geitod: 'GeiTod', gei_j2000: 'GeiJ2000', geij2000: 'GeiJ2000',
};

/** Normalize a coordinate system name to the SSC API's case-sensitive enum. */
export function sscCoordSys(value: string): string {
  const key = String(value).toLowerCase();
  if (SSC_COORDS[key]) return SSC_COORDS[key];
  const known = Object.values(SSC_COORDS).find((v) => v.toLowerCase() === key);
  return known ?? String(value);
}

/** Unwrap Jersey wrapper-array JSON encoding: ["com.ClassName", {...}] -> {...}. */
export function unwrapJersey(value: any): any {
  if (Array.isArray(value)) {
    if (value.length === 2 && typeof value[0] === 'string' && value[0].includes('.')) {
      return unwrapJersey(value[1]);
    }
    return value.map(unwrapJersey);
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(value)) out[k] = unwrapJersey((value as any)[k]);
    return out;
  }
  return value;
}

export async function sscGet(path: string, query?: Record<string, unknown>): Promise<any> {
  const url = new URL(`https://sscweb.gsfc.nasa.gov/WS/sscr/2${path}`);
  appendQuery(url, query);
  const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  const data = await parseBody(response);
  if (!response.ok) {
    throw new NasaApiError('NASA API request failed', response.status, data);
  }
  return unwrapJersey(data);
}

export async function sscGraph(options: {
  time_interval: { start: string; end: string };
  satellites: Array<{ id: string; resolution_factor?: number }>;
  graph_options: { coordinate_system: string };
  description?: string;
}): Promise<any> {
  const sats = options.satellites
    .map(
      (s) =>
        `<Satellites><Id>${xmlEscape(s.id)}</Id><ResolutionFactor>${s.resolution_factor ?? 1}</ResolutionFactor></Satellites>`,
    )
    .join('');
  const xml =
    `<GraphRequest xmlns="${SSC_NS}">` +
    `<TimeInterval><Start>${xmlEscape(options.time_interval.start)}</Start><End>${xmlEscape(options.time_interval.end)}</End></TimeInterval>` +
    sats +
    `<GraphOptions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="OrbitGraphOptions">` +
    `<CoordinateSystem>${xmlEscape(sscCoordSys(options.graph_options.coordinate_system))}</CoordinateSystem></GraphOptions>` +
    `</GraphRequest>`;
  const response = await fetch('https://sscweb.gsfc.nasa.gov/WS/sscr/2/graphs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/xml', Accept: 'application/json' },
    body: xml,
  });
  const data = await parseBody(response);
  if (!response.ok) {
    throw new NasaApiError('NASA API request failed', response.status, data);
  }
  return unwrapJersey(data);
}

export async function sscLocations(options: {
  time_interval: { start: string; end: string };
  satellites: Array<{ satellite_id: string; resolution_factor?: number }>;
  b_field_model?: { trace_stop_altitude?: number; internal_b_field_model?: string; external_b_field_model?: { key_parameter_values?: string } };
  output_options?: { coordinate_options: Array<{ coordinate_system: string; component: string }> };
  description?: string;
}): Promise<any> {
  const sats = options.satellites
    .map(
      (s) =>
        `<Satellites><Id>${xmlEscape(s.satellite_id)}</Id><ResolutionFactor>${s.resolution_factor ?? 2}</ResolutionFactor></Satellites>`,
    )
    .join('');
  let bfield = '';
  const bf = options.b_field_model;
  if (bf) {
    bfield =
      '<BFieldModel>' +
      (bf.internal_b_field_model ? `<InternalBFieldModel>${xmlEscape(bf.internal_b_field_model)}</InternalBFieldModel>` : '') +
      (bf.external_b_field_model?.key_parameter_values
        ? `<ExternalBFieldModel><KeyParameterValues>${xmlEscape(bf.external_b_field_model.key_parameter_values)}</KeyParameterValues></ExternalBFieldModel>`
        : '') +
      (bf.trace_stop_altitude !== undefined ? `<TraceStopAltitude>${bf.trace_stop_altitude}</TraceStopAltitude>` : '') +
      '</BFieldModel>';
  }
  let output = '';
  const oo = options.output_options;
  if (oo?.coordinate_options?.length) {
    const coords = oo.coordinate_options
      .map(
        (c) =>
          `<CoordinateOptions><CoordinateSystem>${xmlEscape(sscCoordSys(c.coordinate_system))}</CoordinateSystem><Component>${xmlEscape(String(c.component).toUpperCase())}</Component></CoordinateOptions>`,
      )
      .join('');
    output = `<OutputOptions>${coords}</OutputOptions>`;
  }
  const xml =
    `<DataRequest xmlns="${SSC_NS}">` +
    `<TimeInterval><Start>${xmlEscape(options.time_interval.start)}</Start><End>${xmlEscape(options.time_interval.end)}</End></TimeInterval>` +
    sats +
    bfield +
    output +
    `</DataRequest>`;
  const response = await fetch('https://sscweb.gsfc.nasa.gov/WS/sscr/2/locations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/xml', Accept: 'application/json' },
    body: xml,
  });
  const data = await parseBody(response);
  if (!response.ok) {
    throw new NasaApiError('NASA API request failed', response.status, data);
  }
  return unwrapJersey(data);
}

// ---------- CMR GraphQL ----------

const CMR_GQL = 'https://graphql.earthdata.nasa.gov/api';

function gqlValue(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) return `[${value.map(gqlValue).join(', ')}]`;
  if (typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}: ${gqlValue(v)}`)
      .join(', ')}}`;
  }
  if (typeof value === 'string') return JSON.stringify(value);
  return String(value);
}

export function gqlArgsString(args: Record<string, unknown>): string {
  const parts = Object.entries(args)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${gqlValue(v)}`);
  return parts.length ? `(params: {${parts.join(', ')}})` : '';
}

async function cmrGqlPost(query: string): Promise<any> {
  const data = await nasaPost('https://graphql.earthdata.nasa.gov', '/api', { query });
  if (data?.errors?.length) {
    throw new NasaApiError('NASA CMR GraphQL query failed', 200, data.errors);
  }
  return data?.data ?? data;
}

export async function cmrGraphql(root: string, args: Record<string, unknown>, selection: string): Promise<any> {
  return cmrGqlPost(`query { ${root}${gqlArgsString(args)} ${selection} }`);
}

export async function cmrGraphqlRaw(query: string): Promise<any> {
  const data = await nasaPost('https://graphql.earthdata.nasa.gov', '/api', { query });
  return data;
}

export async function cmrGraphqlMutation(
  name: string,
  args: Record<string, unknown>,
  selection: string,
): Promise<any> {
  const parts = Object.entries(args)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${gqlValue(v)}`);
  return cmrGqlPost(`mutation { ${name}${parts.length ? `(${parts.join(', ')})` : ''} ${selection} }`);
}

export const CMR_GQL_URL = CMR_GQL;
