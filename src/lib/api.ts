export async function api<T = any>(
  path: string,
  method = 'GET',
  body?: unknown,
): Promise<T> {
  const r = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Opslaan mislukt');
  return data;
}
