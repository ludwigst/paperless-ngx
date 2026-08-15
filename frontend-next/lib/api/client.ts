import { ApiError, formatApiErrorBody, messageForStatus } from "@/lib/api/errors"

const API_VERSION = "10"

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  if (!headers.has("Accept")) {
    headers.set("Accept", `application/json; version=${API_VERSION}`)
  }
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(path.startsWith("/") ? path : `/api/paperless/${path}`, {
    ...init,
    headers,
    credentials: "same-origin",
  })

  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get("content-type") ?? ""
  const isJson = contentType.includes("application/json")
  const body = isJson ? await response.json().catch(() => null) : await response.text()

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      const next = encodeURIComponent(window.location.pathname + window.location.search)
      // Hard navigation so expired-session state cannot linger in the SPA.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`/login?next=${next}`)
    }
    throw new ApiError(
      response.status,
      messageForStatus(response.status, formatApiErrorBody(body)),
      body,
    )
  }

  return body as T
}

export function toQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue
    search.set(key, String(value))
  }
  const encoded = search.toString()
  return encoded ? `?${encoded}` : ""
}
