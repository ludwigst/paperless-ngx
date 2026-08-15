'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useUiSettings } from '@/hooks/use-auth'
import {
	getSavedView,
	listCorrespondents,
	listCustomFields,
	listDocumentTypes,
	listSavedViews,
	listStoragePaths,
	listTags,
} from '@/lib/api/metadata'
import { queryKeys } from '@/lib/query'
import {
	orderViews,
	savedViewVisibility,
	withVisibility,
} from '@/lib/utils/saved-views'

export function useTags() {
	return useQuery({ queryKey: queryKeys.tags, queryFn: listTags })
}

export function useCorrespondents() {
	return useQuery({
		queryKey: queryKeys.correspondents,
		queryFn: listCorrespondents,
	})
}

export function useDocumentTypes() {
	return useQuery({
		queryKey: queryKeys.documentTypes,
		queryFn: listDocumentTypes,
	})
}

export function useStoragePaths() {
	return useQuery({
		queryKey: queryKeys.storagePaths,
		queryFn: listStoragePaths,
	})
}

export function useCustomFields() {
	return useQuery({
		queryKey: queryKeys.customFields,
		queryFn: listCustomFields,
	})
}

export function useSavedViews() {
	const ui = useUiSettings()
	const query = useQuery({
		queryKey: queryKeys.savedViews,
		queryFn: listSavedViews,
	})
	const results = useMemo(
		() => withVisibility(query.data?.results ?? [], ui.data?.settings),
		[query.data?.results, ui.data?.settings]
	)
	const sidebar = useMemo(() => {
		const visibility = savedViewVisibility(ui.data?.settings)
		return orderViews(results, visibility.sidebarIds, visibility.sidebarOrder)
	}, [results, ui.data?.settings])

	return { ...query, results, sidebar }
}

export function useSavedView(id?: number) {
	return useQuery({
		queryKey: queryKeys.savedView(id ?? 0),
		queryFn: () => getSavedView(id as number),
		enabled: Boolean(id),
	})
}

export function lookupName<T extends { id: number; name?: string }>(
	items: T[] | undefined,
	id?: number | null
) {
	if (!id) return undefined
	return items?.find((item) => item.id === id)?.name
}
