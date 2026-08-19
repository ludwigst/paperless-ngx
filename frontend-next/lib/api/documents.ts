import { apiFetch, toQuery } from '@/lib/api/client'
import type {
	AuditLogEntry,
	BulkEditMethod,
	Document,
	DocumentNote,
	DocumentSuggestions,
	Paginated,
	SelectionData,
} from '@/types/paperless'

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
	payload: Partial<Omit<Document, 'custom_fields'>> & {
		remove_inbox_tags?: boolean
		custom_fields?: Array<{ field: number; value?: unknown }>
	}
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

export function getSelectionData(documents: number[]) {
	return apiFetch<SelectionData>('/api/paperless/documents/selection_data/', {
		method: 'POST',
		body: JSON.stringify({ documents }),
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

export function documentPreviewUrl(
	id: number,
	options: { original?: boolean; version?: number } | boolean = false
) {
	const original =
		typeof options === 'boolean' ? options : Boolean(options.original)
	const version = typeof options === 'boolean' ? undefined : options.version
	return `/api/paperless/documents/${id}/preview/${toQuery({
		original: original ? true : undefined,
		version,
	})}`
}

export function documentThumbUrl(id: number) {
	return `/api/paperless/documents/${id}/thumb/`
}

export function documentDownloadUrl(id: number, original = false) {
	return `/api/paperless/documents/${id}/download/${original ? '?original=true' : ''}`
}

export function editPdfDocuments(input: {
	documents: number[]
	operations: Array<{ page: number; rotate?: number; doc?: number }>
	delete_original?: boolean
	update_document?: boolean
	include_metadata?: boolean
	source_mode?: 'explicit_selection' | 'latest_version'
}) {
	return apiFetch<{ result?: string; task_id?: string }>(
		'/api/paperless/documents/edit_pdf/',
		{
			method: 'POST',
			body: JSON.stringify({
				documents: input.documents,
				operations: input.operations,
				delete_original: input.delete_original ?? false,
				update_document: input.update_document ?? false,
				include_metadata: input.include_metadata ?? true,
				source_mode: input.source_mode ?? 'explicit_selection',
			}),
		}
	)
}

export function addDocumentNote(documentId: number, note: string) {
	return apiFetch<DocumentNote[]>(
		`/api/paperless/documents/${documentId}/notes/`,
		{
			method: 'POST',
			body: JSON.stringify({ note }),
		}
	)
}

export function deleteDocumentNote(documentId: number, noteId: number) {
	return apiFetch<DocumentNote[]>(
		`/api/paperless/documents/${documentId}/notes/?id=${noteId}`,
		{
			method: 'DELETE',
		}
	)
}

export function getDocumentHistory(documentId: number) {
	return apiFetch<AuditLogEntry[]>(
		`/api/paperless/documents/${documentId}/history/`
	)
}

export function getDocumentSuggestions(id: number, aiEnabled = false) {
	const action = aiEnabled ? 'ai_suggestions' : 'suggestions'
	return apiFetch<DocumentSuggestions>(
		`/api/paperless/documents/${id}/${action}/`
	)
}
