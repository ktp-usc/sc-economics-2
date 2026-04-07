export async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
    const res = await fetch(input, {
        credentials: "include",
        headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
        ...init
    });

    const text = await res.text();
    const json = text ? JSON.parse(text) : null;

    if (!res.ok) {
        const message = json?.error ?? `request_failed_${ res.status }`;
        throw new Error(message);
    }

    return (json?.data ?? json) as T;
}

export async function postJSON<T>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
    });

    const text = await res.text();
    let data: unknown = null;
    try { data = text ? JSON.parse(text) : null; } catch { /* non-JSON response */ }

    if (!res.ok) {
        const message =
            isRecord(data) && typeof data.error === 'string'
                ? data.error
                : `HTTP ${res.status} — server returned non-JSON response`;
        throw new Error(message);
    }

    return data as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}
