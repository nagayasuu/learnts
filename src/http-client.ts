import { request, type Dispatcher } from 'undici';

type Headers = Record<string, string>;
type Query = Record<string, string | number | boolean | null | undefined>;
type JsonBody = string | number | boolean | null | JsonBody[] | { [key: string]: JsonBody };

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type HttpClientOptions = {
  baseUrl: string;
  headers?: Headers;
  dispatcher?: Dispatcher;
};

export type HttpRequestOptions = {
  headers?: Headers;
  query?: Query;
  body?: JsonBody;
  signal?: AbortSignal;
};

export type HttpResponse<T> = {
  statusCode: number;
  headers: Record<string, string | string[] | undefined>;
  data: T;
};

export class HttpError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly responseBody: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export type HttpClient = {
  request: <T>(method: HttpMethod, path: string, options?: HttpRequestOptions) => Promise<HttpResponse<T>>;
  get: <T>(path: string, options?: Omit<HttpRequestOptions, 'body'>) => Promise<HttpResponse<T>>;
  post: <T>(path: string, body?: JsonBody, options?: Omit<HttpRequestOptions, 'body'>) => Promise<HttpResponse<T>>;
  put: <T>(path: string, body?: JsonBody, options?: Omit<HttpRequestOptions, 'body'>) => Promise<HttpResponse<T>>;
  delete: <T>(path: string, options?: Omit<HttpRequestOptions, 'body'>) => Promise<HttpResponse<T>>;
};

export function createHttpClient(options: HttpClientOptions): HttpClient {
  const baseUrl = new URL(options.baseUrl);

  const send = async <T>(
    method: HttpMethod,
    path: string,
    requestOptions: HttpRequestOptions = {},
  ): Promise<HttpResponse<T>> => {
    const url = buildUrl(baseUrl, path, requestOptions.query);
    const headers = {
      ...options.headers,
      ...requestOptions.headers,
    };
    const body = requestOptions.body === undefined ? undefined : JSON.stringify(requestOptions.body);

    if (body !== undefined && headers['content-type'] === undefined) {
      headers['content-type'] = 'application/json';
    }

    const response = await request(url, {
      method,
      headers,
      body,
      dispatcher: options.dispatcher,
      signal: requestOptions.signal,
    });

    if (response.statusCode >= 400) {
      const responseBody = await response.body.text();
      throw new HttpError(`HTTP request failed with status ${response.statusCode}`, response.statusCode, responseBody);
    }

    const data = await readResponseBody<T>(response.headers, response.body);

    return {
      statusCode: response.statusCode,
      headers: response.headers,
      data,
    };
  };

  return {
    request: send,
    get: (path, requestOptions) => send('GET', path, requestOptions),
    post: (path, body, requestOptions) => send('POST', path, { ...requestOptions, body }),
    put: (path, body, requestOptions) => send('PUT', path, { ...requestOptions, body }),
    delete: (path, requestOptions) => send('DELETE', path, requestOptions),
  };
}

function buildUrl(baseUrl: URL, path: string, query: Query = {}): URL {
  const url = new URL(path, baseUrl);

  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

async function readResponseBody<T>(
  headers: Record<string, string | string[] | undefined>,
  body: Dispatcher.ResponseData['body'],
): Promise<T> {
  const contentType = headers['content-type'];
  const normalizedContentType = Array.isArray(contentType) ? contentType.join(',') : contentType;

  if (normalizedContentType?.includes('application/json')) {
    return (await body.json()) as T;
  }

  return (await body.text()) as T;
}
