import { spawn } from 'node:child_process';
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import * as dotenv from 'dotenv';

dotenv.config();

type FirestoreValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  timestampValue?: string;
  nullValue?: null;
  arrayValue?: { values?: FirestoreValue[] };
  mapValue?: { fields?: Record<string, FirestoreValue> };
};

type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
};

type RequestOptions = {
  body?: unknown;
  headers?: Record<string, string>;
  method?: 'GET' | 'POST';
};

type ServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

const firebaseProjectId = process.env.FIREBASE_PROJECT_ID || '';
const firebaseApiKey = process.env.FIREBASE_API_KEY || '';
const firestoreDatabaseId = process.env.FIRESTORE_DATABASE_ID || process.env.FIREBASE_FIRESTORE_DATABASE_ID || '(default)';
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS || '';
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const migrationProxy = process.env.MIGRATION_PROXY || process.env.HTTPS_PROXY || process.env.HTTP_PROXY || '';

const required = [
  ['FIREBASE_PROJECT_ID', firebaseProjectId],
  ['VITE_SUPABASE_URL', supabaseUrl],
  ['VITE_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY', supabaseKey],
];

const missing = required.filter(([, value]) => !value).map(([key]) => key);
if (missing.length > 0) {
  throw new Error(`Missing environment variables: ${missing.join(', ')}`);
}

const decodeValue = (value: FirestoreValue): unknown => {
  if ('stringValue' in value) return value.stringValue || '';
  if ('integerValue' in value) return Number(value.integerValue || 0);
  if ('doubleValue' in value) return value.doubleValue || 0;
  if ('booleanValue' in value) return Boolean(value.booleanValue);
  if ('timestampValue' in value) return value.timestampValue || '';
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) return (value.arrayValue?.values || []).map(decodeValue);
  if ('mapValue' in value) return decodeFields(value.mapValue?.fields || {});
  return null;
};

const decodeFields = (fields: Record<string, FirestoreValue>) => {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]),
  );
};

const documentId = (documentName: string) => documentName.split('/').pop() || crypto.randomUUID();

const base64Url = (value: string | Buffer) =>
  Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const signJwt = (serviceAccount: ServiceAccount) => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: serviceAccount.token_uri || 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const unsignedToken = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsignedToken);
  signer.end();

  return `${unsignedToken}.${base64Url(signer.sign(serviceAccount.private_key))}`;
};

const requestWithCurl = async <T>(url: string, options: RequestOptions = {}): Promise<T> => {
  const args = ['--fail-with-body', '--silent', '--show-error', '--location', '--connect-timeout', '30'];

  if (migrationProxy) {
    args.push('--proxy', migrationProxy);
  }

  args.push('--request', options.method || 'GET');

  for (const [key, value] of Object.entries(options.headers || {})) {
    args.push('--header', `${key}: ${value}`);
  }

  if (options.body !== undefined) {
    args.push('--data-binary', typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
  }

  args.push(url);

  return new Promise((resolve, reject) => {
    const child = spawn('curl.exe', args, { windowsHide: true });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error([stderr.trim(), stdout.trim()].filter(Boolean).join('\n') || `curl exited with code ${code}`));
        return;
      }

      if (!stdout.trim()) {
        resolve(undefined as T);
        return;
      }

      try {
        resolve(JSON.parse(stdout) as T);
      } catch {
        resolve(stdout as T);
      }
    });
  });
};

const requestWithFetch = async <T>(url: string, options: RequestOptions = {}): Promise<T> => {
  const headers = {
    'content-type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body === undefined ? undefined : typeof options.body === 'string' ? options.body : JSON.stringify(options.body),
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`);
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
};

const requestJson = async <T>(url: string, options: RequestOptions = {}): Promise<T> => {
  if (migrationProxy) return requestWithCurl<T>(url, options);
  return requestWithFetch<T>(url, options);
};

let cachedGoogleAccessToken: string | null = null;

const getGoogleAccessToken = async () => {
  if (cachedGoogleAccessToken) return cachedGoogleAccessToken;
  if (!serviceAccountPath) return '';

  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8')) as ServiceAccount;
  const assertion = signJwt(serviceAccount);
  const response = await requestJson<{ access_token: string }>(
    serviceAccount.token_uri || 'https://oauth2.googleapis.com/token',
    {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
      }).toString(),
    },
  );

  cachedGoogleAccessToken = response.access_token;
  return cachedGoogleAccessToken;
};

const fetchCollection = async (collectionName: string) => {
  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/${firestoreDatabaseId}/documents/${collectionName}`,
  );
  if (firebaseApiKey) url.searchParams.set('key', firebaseApiKey);

  const accessToken = await getGoogleAccessToken();
  const payload = await requestJson<{ documents?: FirestoreDocument[] }>(url.toString(), {
    headers: accessToken ? { authorization: `Bearer ${accessToken}` } : undefined,
  });
  return (payload.documents || []).map((document) => ({
    id: documentId(document.name),
    ...decodeFields(document.fields || {}),
  }));
};

const productColumns = [
  'id',
  'name',
  'category',
  'material',
  'supplier',
  'description',
  'costPrice',
  'marketPrice',
  'stock',
  'image',
  'status',
  'sku',
] as const;

const activityColumns = [
  'id',
  'productName',
  'action',
  'amount',
  'time',
  'type',
] as const;

const normalizeRows = (tableName: 'products' | 'activities', rows: unknown[]) => {
  const columns = tableName === 'products' ? productColumns : activityColumns;

  return rows.map((row) => {
    const source = row as Record<string, unknown>;
    const normalized: Record<string, unknown> = {};

    for (const column of columns) {
      normalized[column] = source[column] ?? null;
    }

    return normalized;
  });
};

const upsertCollection = async (tableName: 'products' | 'activities', rows: unknown[]) => {
  if (rows.length === 0) return 0;

  console.log(`Upserting ${rows.length} rows into ${tableName}...`);
  const normalizedRows = normalizeRows(tableName, rows);
  const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/${tableName}`;
  await requestJson(endpoint, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      authorization: `Bearer ${supabaseKey}`,
      'content-type': 'application/json',
      prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: normalizedRows,
  });

  return rows.length;
};

const migrate = async () => {
  console.log(migrationProxy ? `Using proxy: ${migrationProxy}` : 'No proxy configured.');
  console.log(`Using Firestore database: ${firestoreDatabaseId}`);
  console.log(serviceAccountPath ? `Using service account: ${serviceAccountPath}` : 'No service account configured.');
  console.log('Reading Firestore collections...');

  const products = await fetchCollection('products');
  const activities = await fetchCollection('activities');

  console.log(`Found ${products.length} products and ${activities.length} activities.`);

  console.log('Writing data into Supabase...');
  const productCount = await upsertCollection('products', products);
  const activityCount = await upsertCollection('activities', activities);

  console.log(`Done. Migrated ${productCount} products and ${activityCount} activities into Supabase.`);
};

migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});
