import { apiFetch, toQuery } from '@/lib/api/client'
import type { Document, Paginated } from '@/types/paperless'

export function listTrash(page = 1, pageSize = 25) {
	return apiFetch<Paginated<Document>>(
		`/api/paperless/trash/${toQuery({ page, page_size: pageSize })}`
	)
}

export function restoreTrash(documents: number[]) {
	return apiFetch<{ result?: string; doc_ids?: number[] }>(
		'/api/paperless/trash/',
		{
			method: 'POST',
			body: JSON.stringify({ action: 'restore', documents }),
		}
	)
}

export function emptyTrash(documents?: number[]) {
	return apiFetch<{ result?: string; doc_ids?: number[] }>(
		'/api/paperless/trash/',
		{
			method: 'POST',
			body: JSON.stringify(
				documents?.length
					? { action: 'empty', documents }
					: { action: 'empty' }
			),
		}
	)
}
