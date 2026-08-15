import { describe, expect, it } from 'vitest'

import {
	buildOrdering,
	displayName,
	searchParamsToQuery,
} from '@/lib/utils/search-params'

describe('searchParamsToQuery', () => {
	it('maps shareable UI params onto Paperless filter query vars', () => {
		const params = new URLSearchParams(
			'q=invoice&tags=4&correspondent=9&document_type=2&inbox=1&created_after=2024-01-01'
		)
		expect(searchParamsToQuery(params)).toEqual({
			query: 'invoice',
			tags__id__all: '4',
			correspondent__id: '9',
			document_type__id: '2',
			is_in_inbox: true,
			created__date__gte: '2024-01-01',
		})
	})
})

describe('buildOrdering', () => {
	it('defaults to newest created', () => {
		expect(buildOrdering(null, null)).toBe('-created')
	})

	it('applies reverse flags', () => {
		expect(buildOrdering('title', '1')).toBe('-title')
		expect(buildOrdering('-title', '0')).toBe('title')
	})
})

describe('displayName', () => {
	it('prefers a full name', () => {
		expect(displayName('Ada', 'Lovelace', 'ada')).toBe('Ada Lovelace')
		expect(displayName('', '', 'ada')).toBe('ada')
	})
})
