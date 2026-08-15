import { apiFetch, toQuery } from '@/lib/api/client'
import type { BulkEditMethod, Document, Paginated } from '@/types/paperless'

export interface DocumentListParams {
	page?: number
	page_size?: number
	ordering?: string
	query?: Record<string, string | number | boolean | undefined>
}

export function listDocuments(params: DocumentListParams = {}) {
	const {
		page = 1,
		page_size = 25,
		ordering = '-created',
		query = {},
	} = params
	return apiFetch<Paginated<Document>>(
		`/api/paperless/documents/${toQuery({ page, page_size, ordering, truncate_content: true, ...query })}`
	)
}

export function getDocument(id: number) {
	return apiFetch<Document>(
		`/api/paperless/documents/${id}/${toQuery({ full_perms: true })}`
	)
}

export function patchDocument(
	id: number,
	payload: Partial<Document> & { remove_inbox_tags?: boolean }
) {
	return apiFetch<Document>(`/api/paperless/documents/${id}/`, {
		method: 'PATCH',
		body: JSON.stringify(payload),
	})
}

export function deleteDocument(id: number) {
	return apiFetch<void>(`/api/paperless/documents/${id}/`, {
		method: 'DELETE',
	})
}

export function bulkEditDocuments(input: {
	documents?: number[]
	all?: boolean
	method: BulkEditMethod
	parameters?: Record<string, unknown>
}) {
	return apiFetch<{ result?: string; task_id?: string }>(
		'/api/paperless/documents/bulk_edit/',
		{
			method: 'POST',
			body: JSON.stringify({
				documents: input.documents,
				all: input.all ?? false,
				method: input.method,
				parameters: input.parameters ?? {},
			}),
		}
	)
}

export function bulkDeleteDocuments(documents: number[]) {
	return apiFetch<{ result?: string; task_id?: string }>(
		'/api/paperless/documents/delete/',
		{
			method: 'POST',
			body: JSON.stringify({ documents }),
		}
	)
}

export function uploadDocument(
	file: File,
	extras: Record<string, string> = {},
	signal?: AbortSignal
) {
	const form = new FormData()
	form.append('document', file, file.name)
	form.append('from_webui', 'true')
	for (const [key, value] of Object.entries(extras)) {
		form.append(key, value)
	}
	return apiFetch<{ task_id?: string }>(
		'/api/paperless/documents/post_document/',
		{
			method: 'POST',
			body: form,
			signal,
		}
	)
}

export function documentPreviewUrl(id: number, original = false) {
	return `/api/paperless/documents/${id}/preview/${original ? '?original=true' : ''}`
}

export function documentThumbUrl(id: number) {
	return `/api/paperless/documents/${id}/thumb/`
}

export function documentDownloadUrl(id: number, original = false) {
	return `/api/paperless/documents/${id}/download/${original ? '?original=true' : ''}`
}

export function addDocumentNote(documentId: number, note: string) {
	return apiFetch(`/api/paperless/documents/${documentId}/notes/`, {
		method: 'POST',
		body: JSON.stringify({ note }),
	})
}

export function deleteDocumentNote(documentId: number, noteId: number) {
	return apiFetch(
		`/api/paperless/documents/${documentId}/notes/?id=${noteId}`,
		{
			method: 'DELETE',
		}
	)
}

export function getDocumentHistory(documentId: number) {
	return apiFetch(`/api/paperless/documents/${documentId}/history/`)
}
