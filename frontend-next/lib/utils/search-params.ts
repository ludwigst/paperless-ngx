export interface DocumentQueryState {
	q?: string
	tags?: string
	correspondent?: string
	document_type?: string
	storage_path?: string
	inbox?: string
	page?: string
	page_size?: string
	ordering?: string
	reverse?: string
	created_after?: string
	created_before?: string
	added_after?: string
	added_before?: string
}

export function searchParamsToQuery(
	params: URLSearchParams
): Record<string, string | number | boolean> {
	const query: Record<string, string | number | boolean> = {}
	const q = params.get('q')
	if (q) query.query = q

	const tags = params.get('tags')
	if (tags) query.tags__id__all = tags

	const correspondent = params.get('correspondent')
	if (correspondent) query.correspondent__id = correspondent

	const documentType = params.get('document_type')
	if (documentType) query.document_type__id = documentType

	const storagePath = params.get('storage_path')
	if (storagePath) query.storage_path__id = storagePath

	if (params.get('inbox') === '1') query.is_in_inbox = true

	const createdAfter = params.get('created_after')
	if (createdAfter) query.created__date__gte = createdAfter

	const createdBefore = params.get('created_before')
	if (createdBefore) query.created__date__lte = createdBefore

	const addedAfter = params.get('added_after')
	if (addedAfter) query.added__date__gte = addedAfter

	const addedBefore = params.get('added_before')
	if (addedBefore) query.added__date__lte = addedBefore

	return query
}

export function buildOrdering(
	ordering?: string | null,
	reverse?: string | null
) {
	const field = ordering || '-created'
	if (reverse === '1' && !field.startsWith('-')) return `-${field}`
	if (reverse === '0' && field.startsWith('-')) return field.slice(1)
	return field
}

export function displayName(
	first?: string | null,
	last?: string | null,
	username?: string | null
) {
	const full = [first, last].filter(Boolean).join(' ').trim()
	return full || username || 'Account'
}
