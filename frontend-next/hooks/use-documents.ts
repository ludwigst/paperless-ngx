'use client'

import { useQuery } from '@tanstack/react-query'

import { listDocuments } from '@/lib/api/documents'
import { queryKeys } from '@/lib/query'
import { queryParamsFromFilterRules } from '@/lib/utils/filter-rules'
import { buildOrdering, searchParamsToQuery } from '@/lib/utils/search-params'
import type { SavedView } from '@/types/paperless'

function orderingFromView(view?: SavedView | null) {
	if (!view?.sort_field) return null
	if (view.sort_reverse && !view.sort_field.startsWith('-')) {
		return `-${view.sort_field}`
	}
	return view.sort_field
}

export function useDocuments(
	searchParams: URLSearchParams,
	view?: SavedView | null
) {
	const page = Number(searchParams.get('page') ?? '1')
	const pageSize = Number(
		searchParams.get('page_size') ?? view?.page_size ?? '25'
	)
	const ordering = searchParams.get('ordering')
		? buildOrdering(searchParams.get('ordering'), searchParams.get('reverse'))
		: (orderingFromView(view) ?? buildOrdering(null, null))
	const query = {
		...queryParamsFromFilterRules(view?.filter_rules),
		...searchParamsToQuery(searchParams),
	}

	return useQuery({
		queryKey: queryKeys.documents({
			page,
			pageSize,
			ordering,
			query,
			view: view?.id,
		}),
		queryFn: () =>
			listDocuments({ page, page_size: pageSize, ordering, query }),
		placeholderData: (previous) => previous,
	})
}
