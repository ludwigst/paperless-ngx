import { describe, expect, it } from 'vitest'

import {
	filterRulesFromQuery,
	queryParamsFromFilterRules,
} from '@/lib/utils/filter-rules'

describe('queryParamsFromFilterRules', () => {
	it('maps inbox, tags, type, and full-text rules onto document filtervars', () => {
		expect(
			queryParamsFromFilterRules([
				{ rule_type: 5, value: 'true' },
				{ rule_type: 6, value: '4' },
				{ rule_type: 6, value: '9' },
				{ rule_type: 4, value: '2' },
				{ rule_type: 20, value: 'invoice' },
			])
		).toEqual({
			is_in_inbox: 1,
			tags__id__all: '4,9',
			document_type__id: '2',
			query: 'invoice',
		})
	})

	it('rewrites legacy title/content rules to Tantivy params', () => {
		expect(
			queryParamsFromFilterRules([
				{ rule_type: 0, value: 'tax' },
				{ rule_type: 19, value: 'receipt' },
			])
		).toEqual({
			title_search: 'tax',
			text: 'receipt',
		})
	})

	it('encodes unset correspondent as isnull', () => {
		expect(queryParamsFromFilterRules([{ rule_type: 3, value: '' }])).toEqual({
			correspondent__isnull: 1,
		})
	})
})

describe('filterRulesFromQuery', () => {
	it('round-trips multi-value tag filters', () => {
		const query = queryParamsFromFilterRules([
			{ rule_type: 6, value: '4' },
			{ rule_type: 6, value: '9' },
		])
		expect(filterRulesFromQuery(query)).toEqual([
			{ rule_type: 6, value: '4' },
			{ rule_type: 6, value: '9' },
		])
	})
})
