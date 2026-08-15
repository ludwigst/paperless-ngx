import { apiFetch } from '@/lib/api/client'
import type { ShareLink } from '@/types/paperless'

export function listShareLinks(documentId: number) {
	return apiFetch<ShareLink[]>(
		`/api/paperless/documents/${documentId}/share_links/`
	)
}

export function createShareLink(input: {
	document: number
	file_version?: 'archive' | 'original'
	expiration?: string | null
}) {
	return apiFetch<ShareLink>('/api/paperless/share_links/', {
		method: 'POST',
		body: JSON.stringify({
			document: input.document,
			file_version: input.file_version ?? 'archive',
			expiration: input.expiration ?? null,
		}),
	})
}

export function deleteShareLink(id: number) {
	return apiFetch<void>(`/api/paperless/share_links/${id}/`, {
		method: 'DELETE',
	})
}

export function shareLinkUrl(slug: string) {
	const origin = (
		process.env.NEXT_PUBLIC_PAPERLESS_URL ||
		process.env.PAPERLESS_URL ||
		'http://localhost:8000'
	).replace(/\/$/, '')
	return `${origin}/share/${slug}`
}

export function expirationFromDays(days: number | null) {
	if (days == null) return null
	const date = new Date()
	date.setDate(date.getDate() + days)
	return date.toISOString()
}
