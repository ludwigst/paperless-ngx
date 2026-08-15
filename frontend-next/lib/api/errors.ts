export class ApiError extends Error {
	readonly status: number
	readonly details: unknown

	constructor(status: number, message: string, details?: unknown) {
		super(message)
		this.name = 'ApiError'
		this.status = status
		this.details = details
	}
}

export function messageForStatus(status: number, fallback?: string): string {
	switch (status) {
		case 400:
			return (
				fallback ??
				'The request could not be processed. Check the form and try again.'
			)
		case 401:
			return 'Your session expired. Please sign in again.'
		case 403:
			return 'You do not have permission to do that.'
		case 404:
			return 'That item could not be found.'
		case 409:
			return 'This change conflicts with the current state. Refresh and try again.'
		case 429:
			return 'Too many requests. Wait a moment and try again.'
		case 500:
		case 502:
		case 503:
			return 'The server ran into a problem. Try again shortly.'
		default:
			return fallback ?? 'Something went wrong.'
	}
}

export function formatApiErrorBody(body: unknown): string | undefined {
	if (!body) return undefined
	if (typeof body === 'string') return body
	if (typeof body !== 'object') return undefined

	const record = body as Record<string, unknown>
	if (typeof record.detail === 'string') return record.detail
	if (Array.isArray(record.non_field_errors)) {
		return record.non_field_errors.map(String).join(' ')
	}

	const fieldMessages = Object.entries(record)
		.flatMap(([key, value]) => {
			if (Array.isArray(value))
				return value.map((item) => `${key}: ${String(item)}`)
			if (typeof value === 'string') return [`${key}: ${value}`]
			return []
		})
		.slice(0, 6)

	return fieldMessages.length ? fieldMessages.join(' ') : undefined
}

export function isMfaRequired(body: unknown): boolean {
	const text = JSON.stringify(body ?? '').toLowerCase()
	return text.includes('mfa') || text.includes('code is required')
}
