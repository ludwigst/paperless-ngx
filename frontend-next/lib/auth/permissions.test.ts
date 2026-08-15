import { describe, expect, it } from 'vitest'

import { can, permissionCode } from '@/lib/auth/permissions'

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
})
