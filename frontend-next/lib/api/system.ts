import { apiFetch, toQuery } from '@/lib/api/client'
import type {
	Group,
	Paginated,
	PaperlessTask,
	Statistics,
	UiSettingsResponse,
	User,
	Workflow,
} from '@/types/paperless'

export function getUiSettings() {
	return apiFetch<UiSettingsResponse>('/api/paperless/ui_settings/')
}

export function saveUiSettings(settings: Record<string, unknown>) {
	return apiFetch('/api/paperless/ui_settings/', {
		method: 'POST',
		body: JSON.stringify({ settings }),
	})
}

export function getStatistics() {
	return apiFetch<Statistics>('/api/paperless/statistics/')
}

export function listTasks(
	params: { page?: number; page_size?: number; ordering?: string } = {}
) {
	return apiFetch<Paginated<PaperlessTask>>(
		`/api/paperless/tasks/${toQuery({ page: 1, page_size: 50, ordering: '-date_created', ...params })}`
	)
}

export function listUsers() {
	return apiFetch<Paginated<User>>(
		`/api/paperless/users/${toQuery({ page_size: 1000 })}`
	)
}

export function listGroups() {
	return apiFetch<Paginated<Group>>(
		`/api/paperless/groups/${toQuery({ page_size: 1000 })}`
	)
}

export function listWorkflows() {
	return apiFetch<Paginated<Workflow>>(
		`/api/paperless/workflows/${toQuery({ page_size: 1000 })}`
	)
}

export function patchWorkflow(id: number, payload: Partial<Workflow>) {
	return apiFetch<Workflow>(`/api/paperless/workflows/${id}/`, {
		method: 'PATCH',
		body: JSON.stringify(payload),
	})
}

export function globalSearch(query: string) {
	return apiFetch(`/api/paperless/search/${toQuery({ query })}`)
}
