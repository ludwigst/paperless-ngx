import { QueryClient } from '@tanstack/react-query'

export function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 30_000,
				refetchOnWindowFocus: false,
				retry: (failureCount, error) => {
					const status =
						typeof error === 'object' && error && 'status' in error
							? Number(error.status)
							: 0
					if (status === 401 || status === 403 || status === 404) return false
					return failureCount < 2
				},
			},
		},
	})
}

export const queryKeys = {
	uiSettings: ['ui-settings'] as const,
	statistics: ['statistics'] as const,
	documents: (params: unknown) => ['documents', params] as const,
	document: (id: number) => ['document', id] as const,
	tags: ['tags'] as const,
	correspondents: ['correspondents'] as const,
	documentTypes: ['document-types'] as const,
	storagePaths: ['storage-paths'] as const,
	customFields: ['custom-fields'] as const,
	savedViews: ['saved-views'] as const,
	tasks: ['tasks'] as const,
	users: ['users'] as const,
	groups: ['groups'] as const,
	workflows: ['workflows'] as const,
}
