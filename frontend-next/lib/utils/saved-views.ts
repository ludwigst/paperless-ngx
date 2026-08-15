import type { SavedView } from '@/types/paperless'

type SettingsBag = Record<string, unknown>

function asRecord(value: unknown): SettingsBag {
	return value && typeof value === 'object' && !Array.isArray(value)
		? (value as SettingsBag)
		: {}
}

function numberList(value: unknown): number[] {
	return Array.isArray(value)
		? value.map(Number).filter((item) => Number.isFinite(item))
		: []
}

export function savedViewVisibility(settings: SettingsBag | undefined) {
	const saved = asRecord(settings?.saved_views)
	return {
		sidebarIds: numberList(saved.sidebar_views_visible_ids),
		dashboardIds: numberList(saved.dashboard_views_visible_ids),
		sidebarOrder: numberList(saved.sidebar_views_sort_order),
		dashboardOrder: numberList(saved.dashboard_views_sort_order),
	}
}

export function orderViews(
	views: SavedView[],
	visibleIds: number[],
	sortOrder: number[]
) {
	const visible = views.filter((view) => visibleIds.includes(view.id))
	if (!sortOrder.length) return visible
	const ordered = sortOrder
		.map((id) => visible.find((view) => view.id === id))
		.filter((view): view is SavedView => Boolean(view))
	return [
		...ordered,
		...visible.filter((view) => !sortOrder.includes(view.id)),
	]
}

export function withVisibility(
	views: SavedView[],
	settings: SettingsBag | undefined
) {
	const visibility = savedViewVisibility(settings)
	return views.map((view) => ({
		...view,
		show_in_sidebar: visibility.sidebarIds.includes(view.id),
		show_on_dashboard: visibility.dashboardIds.includes(view.id),
	}))
}

export function patchSavedViewVisibility(
	settings: SettingsBag,
	patch: {
		sidebarIds?: number[]
		dashboardIds?: number[]
		sidebarOrder?: number[]
		dashboardOrder?: number[]
	}
): SettingsBag {
	const next: SettingsBag = {
		...settings,
		saved_views: {
			...asRecord(settings.saved_views),
		},
	}
	const saved = next.saved_views as SettingsBag
	if (patch.sidebarIds) saved.sidebar_views_visible_ids = patch.sidebarIds
	if (patch.dashboardIds)
		saved.dashboard_views_visible_ids = patch.dashboardIds
	if (patch.sidebarOrder) saved.sidebar_views_sort_order = patch.sidebarOrder
	if (patch.dashboardOrder) {
		saved.dashboard_views_sort_order = patch.dashboardOrder
	}
	return next
}

export function toggleId(ids: number[], id: number, enabled: boolean) {
	const next = ids.filter((item) => item !== id)
	if (enabled) next.push(id)
	return next
}

export function trashDaysRemaining(
	deletedAt: string | null | undefined,
	delay: number
) {
	if (!deletedAt) return null
	const elapsed = Math.ceil(
		(Date.now() - new Date(deletedAt).getTime()) / (1000 * 60 * 60 * 24)
	)
	return delay - elapsed
}
