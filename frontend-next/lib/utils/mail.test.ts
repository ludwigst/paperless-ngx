import { describe, expect, it } from 'vitest'

import {
	accountPayload,
	copyMailRule,
	emptyMailRule,
	isObfuscatedPassword,
	ruleNeedsActionParameter,
	rulePayload,
	validateMailAccount,
	validateMailRule,
} from '@/lib/utils/mail'

describe('mail passwords', () => {
	it('detects Django obfuscated secrets', () => {
		expect(isObfuscatedPassword('**********')).toBe(true)
		expect(isObfuscatedPassword('secret')).toBe(false)
		expect(isObfuscatedPassword('')).toBe(false)
	})
})

describe('mail account validation', () => {
	it('requires name, server, username, and a password on create', () => {
		expect(validateMailAccount({})).toBe('Name is required')
		expect(
			validateMailAccount({
				name: 'Work',
				imap_server: 'imap.example.com',
				username: 'me',
			})
		).toBe('Password is required')
		expect(
			validateMailAccount({
				id: 4,
				name: 'Work',
				imap_server: 'imap.example.com',
				username: 'me',
			})
		).toBeNull()
	})

	it('keeps obfuscated passwords so Django will not rotate them', () => {
		expect(
			accountPayload({
				id: 1,
				name: 'Work',
				imap_server: 'imap.example.com',
				username: 'me',
				password: '**********',
				imap_security: 2,
			}).password
		).toBe('**********')
	})
})

describe('mail rules', () => {
	it('requires a folder or IMAP tag for move and tag actions', () => {
		expect(ruleNeedsActionParameter(2)).toBe(true)
		expect(ruleNeedsActionParameter(5)).toBe(true)
		expect(ruleNeedsActionParameter(3)).toBe(false)
		expect(
			validateMailRule({ name: 'Inbox PDF', account: 1, action: 2 })
		).toBe('Folder is required for move')
		expect(
			validateMailRule({
				name: 'Inbox PDF',
				account: 1,
				action: 2,
				action_parameter: 'Archive',
			})
		).toBeNull()
	})

	it('copies a rule without its id', () => {
		const copy = copyMailRule({
			...emptyMailRule(3),
			id: 9,
			name: 'Receipts',
		})
		expect(copy.name).toBe('Receipts (copy)')
		expect('id' in copy).toBe(false)
		expect(copy.account).toBe(3)
	})

	it('keeps PDF layout 0 (system default)', () => {
		expect(
			rulePayload({ name: 'Read', account: 1, action: 3, pdf_layout: 0 })
				.pdf_layout
		).toBe(0)
	})
})
