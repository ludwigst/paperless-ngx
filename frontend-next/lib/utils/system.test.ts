import { describe, expect, it } from 'vitest'

import {
	clampLogLimit,
	formatBytes,
	hasStatusError,
	isStale,
	parseLogLevel,
} from '@/lib/utils/system'

describe('log parsing', () => {
	it('reads Django log level tokens', () => {
		expect(parseLogLevel('[INFO] started')).toBe(20)
		expect(parseLogLevel('[DEBUG] trace')).toBe(10)
		expect(parseLogLevel('[WARNING] slow')).toBe(30)
		expect(parseLogLevel('[ERROR] failed')).toBe(40)
		expect(parseLogLevel('[CRITICAL] down')).toBe(50)
	})

	it('clamps the log line limit', () => {
		expect(clampLogLimit(50)).toBe(100)
		expect(clampLogLimit(5000)).toBe(5000)
		expect(clampLogLimit(999_999)).toBe(50_000)
		expect(clampLogLimit(Number.NaN)).toBe(5000)
	})
})

describe('system status helpers', () => {
	it('formats byte counts', () => {
		expect(formatBytes(512)).toBe('512 B')
		expect(formatBytes(2048)).toBe('2.0 KB')
	})

	it('flags dates older than 24 hours as stale', () => {
		const old = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
		const recent = new Date().toISOString()
		expect(isStale(old)).toBe(true)
		expect(isStale(recent)).toBe(false)
		expect(isStale(null)).toBe(false)
	})

	it('detects an ERROR in any health check', () => {
		expect(
			hasStatusError({
				database: { status: 'OK' },
				tasks: { redis_status: 'ERROR' },
			})
		).toBe(true)
		expect(
			hasStatusError({
				database: { status: 'OK' },
				tasks: { redis_status: 'OK', celery_status: 'WARNING' },
			})
		).toBe(false)
	})
})
