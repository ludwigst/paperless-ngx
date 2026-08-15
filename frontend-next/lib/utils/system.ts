import type { SystemStatus } from '@/types/paperless'

export type LogLevel = 10 | 20 | 30 | 40 | 50

export function parseLogLevel(line: string): LogLevel {
	if (line.includes('[DEBUG]')) return 10
	if (line.includes('[WARNING]')) return 30
	if (line.includes('[ERROR]')) return 40
	if (line.includes('[CRITICAL]')) return 50
	return 20
}

export function logLevelClass(level: LogLevel) {
	switch (level) {
		case 10:
			return 'text-zinc-400'
		case 30:
			return 'text-amber-300'
		case 40:
			return 'text-red-400'
		case 50:
			return 'font-semibold text-red-300'
		default:
			return 'text-zinc-100'
	}
}

export function clampLogLimit(value: number) {
	if (!Number.isFinite(value)) return 5000
	return Math.min(50_000, Math.max(100, Math.floor(value)))
}

export function formatBytes(bytes?: number | null) {
	if (bytes == null || Number.isNaN(bytes)) return '—'
	const units = ['B', 'KB', 'MB', 'GB', 'TB']
	let value = bytes
	let index = 0
	while (value >= 1024 && index < units.length - 1) {
		value /= 1024
		index += 1
	}
	return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

export function isStale(dateStr?: string | null, hours = 24) {
	if (!dateStr) return false
	const then = new Date(dateStr).getTime()
	if (Number.isNaN(then)) return false
	return Date.now() - then > hours * 60 * 60 * 1000
}

export function healthTone(status?: string | null) {
	if (status === 'ERROR') return 'destructive' as const
	if (status === 'WARNING') return 'outline' as const
	if (status === 'DISABLED') return 'secondary' as const
	return 'secondary' as const
}

export function hasStatusError(status?: SystemStatus | null) {
	if (!status) return false
	const values = [
		status.database?.status,
		status.tasks?.redis_status,
		status.tasks?.celery_status,
		status.tasks?.index_status,
		status.tasks?.classifier_status,
		status.tasks?.sanity_check_status,
	]
	return values.some((value) => value === 'ERROR')
}

export const RUNNABLE_TASKS = [
	{ type: 'train_classifier', label: 'Train classifier' },
	{ type: 'sanity_check', label: 'Sanity check' },
	{ type: 'llm_index', label: 'AI index' },
] as const
