import { describe, expect, it } from 'vitest'

import { buildPaperlessProxyUrl } from '@/lib/api/proxy'

describe('buildPaperlessProxyUrl', () => {
	it('builds a same-origin API URL from path segments', () => {
		const url = buildPaperlessProxyUrl(
			'http://localhost:8000',
			['documents', '12'],
			'?page=2'
		)
		expect(url?.toString()).toBe(
			'http://localhost:8000/api/documents/12/?page=2'
		)
	})

	it('rejects empty, traversal, and protocol-bearing segments', () => {
		expect(buildPaperlessProxyUrl('http://localhost:8000', [])).toBeNull()
		expect(
			buildPaperlessProxyUrl('http://localhost:8000', ['..', 'secret'])
		).toBeNull()
		expect(
			buildPaperlessProxyUrl('http://localhost:8000', [
				'https:',
				'',
				'evil.example',
			])
		).toBeNull()
	})

	it('rejects an invalid backend URL', () => {
		expect(buildPaperlessProxyUrl('not-a-url', ['documents'])).toBeNull()
	})
})
