export const TOKEN_COOKIE = 'pngx_token'
export const API_VERSION = '10'

export function paperlessBackendUrl() {
	return (process.env.PAPERLESS_URL ?? 'http://localhost:8000').replace(
		/\/$/,
		''
	)
}

export function tokenCookieOptions(maxAgeSeconds = 60 * 60 * 24 * 14) {
	return {
		httpOnly: true,
		sameSite: 'lax' as const,
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		maxAge: maxAgeSeconds,
	}
}
