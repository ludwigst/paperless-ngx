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

	it('allows mail account test and process paths', () => {
		expect(
			buildPaperlessProxyUrl('http://localhost:8000', [
				'mail_accounts',
				'test',
			])?.pathname
		).toBe('/api/mail_accounts/test/')
		expect(
			buildPaperlessProxyUrl('http://localhost:8000', [
				'mail_accounts',
				'4',
				'process',
			])?.pathname
		).toBe('/api/mail_accounts/4/process/')
		expect(
			buildPaperlessProxyUrl('http://localhost:8000', [
				'processed_mail',
				'bulk_delete',
			])?.pathname
		).toBe('/api/processed_mail/bulk_delete/')
		expect(
			buildPaperlessProxyUrl(
				'http://localhost:8000',
				['logs', 'paperless'],
				'?limit=5000'
			)?.pathname
		).toBe('/api/logs/paperless/')
		expect(
			buildPaperlessProxyUrl('http://localhost:8000', ['status'])?.pathname
		).toBe('/api/status/')
		expect(
			buildPaperlessProxyUrl('http://localhost:8000', ['tasks', 'run'])
				?.pathname
		).toBe('/api/tasks/run/')
	})
})
