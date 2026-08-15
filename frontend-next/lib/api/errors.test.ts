import { describe, expect, it } from 'vitest'

import {
	formatApiErrorBody,
	isMfaRequired,
	messageForStatus,
} from '@/lib/api/errors'

describe('messageForStatus', () => {
	it('maps common HTTP statuses to actionable copy', () => {
		expect(messageForStatus(401)).toMatch(/sign in/i)
		expect(messageForStatus(403)).toMatch(/permission/i)
		expect(messageForStatus(404)).toMatch(/found/i)
		expect(messageForStatus(429)).toMatch(/too many/i)
	})
})

describe('formatApiErrorBody', () => {
	it('prefers DRF detail strings', () => {
		expect(formatApiErrorBody({ detail: 'Invalid credentials' })).toBe(
			'Invalid credentials'
		)
	})

	it('joins field errors', () => {
		expect(
			formatApiErrorBody({ title: ['This field is required.'] })
		).toContain('title')
	})
})

describe('isMfaRequired', () => {
	it('detects MFA prompts', () => {
		expect(isMfaRequired({ non_field_errors: ['MFA code is required'] })).toBe(
			true
		)
		expect(isMfaRequired({ detail: 'nope' })).toBe(false)
	})
})
