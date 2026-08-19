import { describe, expect, it } from 'vitest'

import {
	CHAT_METADATA_DELIMITER,
	documentIdFromPath,
	hasInboxTag,
	isAiEnabled,
	parseChatResponse,
} from '@/lib/utils/chat'

describe('parseChatResponse', () => {
	it('returns the full string when there is no trailer', () => {
		expect(parseChatResponse('Hello')).toEqual({ content: 'Hello' })
	})

	it('parses references from the metadata trailer', () => {
		const parsed = parseChatResponse(
			`Answer text${CHAT_METADATA_DELIMITER}{"references":[{"id":1,"title":"Invoice"}]}`
		)
		expect(parsed.content).toBe('Answer text')
		expect(parsed.references).toEqual([{ id: 1, title: 'Invoice' }])
	})

	it('hides an incomplete metadata trailer', () => {
		const parsed = parseChatResponse(
			`Answer text${CHAT_METADATA_DELIMITER}{"references"`
		)
		expect(parsed.content).toBe('Answer text')
		expect(parsed.references).toBeUndefined()
	})
})

describe('chat helpers', () => {
	it('reads a document id from the detail path', () => {
		expect(documentIdFromPath('/documents/42')).toBe(42)
		expect(documentIdFromPath('/documents')).toBeUndefined()
		expect(documentIdFromPath('/inbox')).toBeUndefined()
	})

	it('reads ai_enabled from UI settings', () => {
		expect(isAiEnabled()).toBe(false)
		expect(isAiEnabled({ ai_enabled: true })).toBe(true)
	})

	it('detects inbox tags on a document', () => {
		expect(
			hasInboxTag(
				[1, 2],
				[
					{ id: 1, is_inbox_tag: false },
					{ id: 2, is_inbox_tag: true },
				]
			)
		).toBe(true)
		expect(hasInboxTag([1], [{ id: 1, is_inbox_tag: false }])).toBe(false)
	})
})
