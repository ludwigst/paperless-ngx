import { describe, expect, it } from 'vitest'

import { expirationFromDays, shareLinkUrl } from '@/lib/api/share-links'
import {
	customFieldInputKind,
	displayCustomFieldValue,
	parseCustomFieldValue,
	summarizeHistoryChange,
} from '@/lib/utils/custom-fields'
import { CustomFieldDataType } from '@/types/paperless'

describe('custom field values', () => {
	it('parses numbers, booleans, and document links', () => {
		expect(parseCustomFieldValue(CustomFieldDataType.Integer, '12')).toBe(12)
		expect(parseCustomFieldValue(CustomFieldDataType.Boolean, 'true')).toBe(
			true
		)
		expect(
			parseCustomFieldValue(CustomFieldDataType.DocumentLink, '4, 8')
		).toEqual([4, 8])
		expect(parseCustomFieldValue(CustomFieldDataType.String, '')).toBeNull()
	})

	it('displays arrays and booleans for the form', () => {
		expect(displayCustomFieldValue([1, 2])).toBe('1, 2')
		expect(displayCustomFieldValue(false)).toBe('false')
	})

	it('picks an input kind from the field type', () => {
		expect(
			customFieldInputKind({ data_type: CustomFieldDataType.LongText })
		).toBe('textarea')
		expect(
			customFieldInputKind({ data_type: CustomFieldDataType.Select })
		).toBe('select')
	})
})

describe('history summaries', () => {
	it('formats tuple and custom-field changes', () => {
		expect(summarizeHistoryChange('title', ['Old', 'New'])).toBe('title: New')
		expect(
			summarizeHistoryChange('tags', {
				type: 'm2m',
				operation: 'add',
				objects: ['Inbox'],
			})
		).toBe('add tags: Inbox')
		expect(
			summarizeHistoryChange('custom_fields', {
				type: 'custom_field',
				field: 'Invoice number',
				value: '42',
			})
		).toBe('Invoice number: 42')
	})
})

describe('share links', () => {
	it('builds a Django public share URL', () => {
		expect(shareLinkUrl('abc')).toMatch(/\/share\/abc$/)
	})

	it('turns expiration days into an ISO timestamp', () => {
		expect(expirationFromDays(null)).toBeNull()
		const iso = expirationFromDays(7)
		expect(iso).toBeTruthy()
		expect(new Date(iso as string).getTime()).toBeGreaterThan(Date.now())
	})
})
