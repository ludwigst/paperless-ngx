import { describe, expect, it } from 'vitest'

import {
	bulkAssignMessage,
	bulkTagsMessage,
	listNames,
	wantsBulkConfirmation,
} from '@/lib/utils/bulk-edit'

describe('bulk edit copy', () => {
	it('confirms by default', () => {
		expect(wantsBulkConfirmation()).toBe(true)
		expect(wantsBulkConfirmation({})).toBe(true)
		expect(
			wantsBulkConfirmation({
				'general-settings:bulk-edit:confirmation-dialogs': false,
			})
		).toBe(false)
	})

	it('lists names the way Angular does', () => {
		expect(listNames(['Inbox'])).toBe('"Inbox"')
		expect(listNames(['A', 'B'])).toBe('"A" and "B"')
		expect(listNames(['A', 'B', 'C'])).toBe('"A", "B", and "C"')
	})

	it('describes tag add and remove', () => {
		expect(bulkTagsMessage(2, ['Tax'], [])).toMatch(/add the tag "Tax"/)
		expect(bulkTagsMessage(1, [], ['Inbox'])).toMatch(
			/remove the tag "Inbox" from 1 selected document/
		)
		expect(bulkTagsMessage(3, ['A'], ['B'])).toMatch(/add "A" and remove "B"/)
	})

	it('describes correspondent / type / path assignment', () => {
		expect(bulkAssignMessage('correspondent', 4, 'Acme')).toMatch(
			/assign the correspondent "Acme" to 4 selected documents/
		)
		expect(bulkAssignMessage('document type', 1, null)).toMatch(
			/remove the document type from 1 selected document/
		)
	})
})
