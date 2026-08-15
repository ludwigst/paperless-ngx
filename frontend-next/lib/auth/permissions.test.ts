import { describe, expect, it } from 'vitest'

import {
	can,
	canViewLogs,
	canViewSystemStatus,
	ownsObject,
	permissionCode,
} from '@/lib/auth/permissions'

describe('permissions', () => {
	it('builds Django-style permission codes', () => {
		expect(permissionCode('view', 'document')).toBe('view_document')
	})

	it('allows superusers everything', () => {
		expect(can({ id: 1, is_superuser: true }, [], 'delete', 'document')).toBe(
			true
		)
	})

	it('checks the permission list for ordinary users', () => {
		expect(can({ id: 2 }, ['view_document'], 'view', 'document')).toBe(true)
		expect(can({ id: 2 }, ['view_document'], 'delete', 'document')).toBe(false)
	})

	it('denies missing users', () => {
		expect(can(null, ['view_document'], 'view', 'document')).toBe(false)
	})

	it('treats unowned objects as owned', () => {
		expect(ownsObject({ id: 2 }, null)).toBe(true)
		expect(ownsObject({ id: 2 }, 2)).toBe(true)
		expect(ownsObject({ id: 2 }, 9)).toBe(false)
		expect(ownsObject({ id: 1, is_superuser: true }, 9)).toBe(true)
	})

	it('gates logs to staff and system status to staff or the dedicated perm', () => {
		expect(canViewLogs({ id: 1, is_staff: true })).toBe(true)
		expect(canViewLogs({ id: 2 })).toBe(false)
		expect(canViewSystemStatus({ id: 2, is_staff: true })).toBe(true)
		expect(canViewSystemStatus({ id: 3 }, ['view_system_monitoring'])).toBe(
			true
		)
		expect(canViewSystemStatus({ id: 3 }, ['view_document'])).toBe(false)
	})
})
