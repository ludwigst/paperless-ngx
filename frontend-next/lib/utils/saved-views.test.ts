import { afterEach, describe, expect, it, vi } from 'vitest'

import {
	orderViews,
	patchSavedViewVisibility,
	toggleId,
	trashDaysRemaining,
	withVisibility,
} from '@/lib/utils/saved-views'
import type { SavedView } from '@/types/paperless'

const views = [
	{
		id: 1,
		name: 'Inbox',
		sort_field: 'created',
		sort_reverse: true,
		filter_rules: [],
	},
	{
		id: 2,
		name: 'Tax',
		sort_field: 'created',
		sort_reverse: true,
		filter_rules: [],
	},
	{
		id: 3,
		name: 'Archive',
		sort_field: 'title',
		sort_reverse: false,
		filter_rules: [],
	},
] as SavedView[]

describe('withVisibility', () => {
	it('overlays sidebar and dashboard flags from UI settings', () => {
		const result = withVisibility(views, {
			saved_views: {
				sidebar_views_visible_ids: [2],
				dashboard_views_visible_ids: [1, 3],
			},
		})
		expect(result.map((view) => view.show_in_sidebar)).toEqual([
			false,
			true,
			false,
		])
		expect(result.map((view) => view.show_on_dashboard)).toEqual([
			true,
			false,
			true,
		])
	})
})

describe('orderViews', () => {
	it('honors sort order then appends leftovers', () => {
		expect(orderViews(views, [1, 2, 3], [3, 1]).map((view) => view.id)).toEqual(
			[3, 1, 2]
		)
	})
})

describe('patchSavedViewVisibility', () => {
	it('merges nested saved_views without dropping other settings', () => {
		const next = patchSavedViewVisibility(
			{
				app_title: 'Paperless',
				saved_views: { sidebar_views_show_count: true },
			},
			{ sidebarIds: [2, 4] }
		)
		expect(next.app_title).toBe('Paperless')
		expect(next.saved_views).toMatchObject({
			sidebar_views_show_count: true,
			sidebar_views_visible_ids: [2, 4],
		})
	})
})

describe('toggleId', () => {
	it('adds and removes without duplicates', () => {
		expect(toggleId([1, 2], 3, true)).toEqual([1, 2, 3])
		expect(toggleId([1, 2, 3], 2, false)).toEqual([1, 3])
		expect(toggleId([1, 2], 2, true)).toEqual([1, 2])
	})
})

describe('trashDaysRemaining', () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('subtracts elapsed days from the server delay', () => {
		const now = Date.UTC(2026, 7, 19, 12, 0, 0)
		vi.spyOn(Date, 'now').mockReturnValue(now)
		const deletedAt = new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString()
		expect(trashDaysRemaining(deletedAt, 30)).toBe(25)
		expect(trashDaysRemaining(null, 30)).toBeNull()
	})
})
