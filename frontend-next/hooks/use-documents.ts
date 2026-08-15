'use client'

import { useQuery } from '@tanstack/react-query'

import { listDocuments } from '@/lib/api/documents'
import { queryKeys } from '@/lib/query'
import { buildOrdering, searchParamsToQuery } from '@/lib/utils/search-params'

export function useDocuments(searchParams: URLSearchParams) {
	const page = Number(searchParams.get('page') ?? '1')
	const pageSize = Number(searchParams.get('page_size') ?? '25')
	const ordering = buildOrdering(
		searchParams.get('ordering'),
		searchParams.get('reverse')
	)
	const query = searchParamsToQuery(searchParams)

	return useQuery({
		queryKey: queryKeys.documents({ page, pageSize, ordering, query }),
		queryFn: () =>
			listDocuments({ page, page_size: pageSize, ordering, query }),
		placeholderData: (previous) => previous,
	})
}
