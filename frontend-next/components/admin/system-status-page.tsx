'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useUiSettings } from '@/hooks/use-auth'
import { getSystemStatus, runSystemTask } from '@/lib/api/system'
import { canViewSystemStatus } from '@/lib/auth/permissions'
import { queryKeys } from '@/lib/query'
import {
	formatBytes,
	hasStatusError,
	healthTone,
	isStale,
} from '@/lib/utils/system'
import type { SystemHealth } from '@/types/paperless'

export function SystemStatusPage() {
	const ui = useUiSettings()
	const queryClient = useQueryClient()
	const allowed = canViewSystemStatus(ui.data?.user, ui.data?.permissions)
	const status = useQuery({
		queryKey: queryKeys.systemStatus,
		queryFn: getSystemStatus,
		enabled: allowed,
		refetchInterval: 30_000,
	})
	const run = useMutation({
		mutationFn: (taskType: string) => runSystemTask(taskType),
		onSuccess: async () => {
			toast.success('Task started')
			await queryClient.invalidateQueries({ queryKey: queryKeys.systemStatus })
			await queryClient.invalidateQueries({ queryKey: queryKeys.tasks })
		},
		onError: (error) => toast.error(error.message),
	})

	if (ui.isLoading) return <Skeleton className="h-64 w-full" />
	if (!allowed) {
		return (
			<p className="text-muted-foreground">
				You do not have permission to view system status.
			</p>
		)
	}

	const data = status.data
	const used =
		data?.storage && data.storage.total
			? data.storage.total - data.storage.available
			: 0
	const usedPct =
		data?.storage?.total && data.storage.total > 0
			? Math.min(100, (used / data.storage.total) * 100)
			: 0
	const superuser = Boolean(ui.data?.user?.is_superuser)

	async function copy() {
		if (!data) return
		try {
			await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
			toast.success('Status copied')
		} catch {
			toast.error('Could not copy status')
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<p className="text-[11px] uppercase tracking-[0.22em] text-copper">
						Administration
					</p>
					<h1 className="font-heading text-4xl italic">System status</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Health of the Django, Redis, Celery, and search stack.
					</p>
				</div>
				<div className="flex gap-2">
					{hasStatusError(data) ? (
						<Badge variant="destructive">Issues detected</Badge>
					) : null}
					<Button
						variant="outline"
						onClick={() => void copy()}
						disabled={!data}
					>
						Copy JSON
					</Button>
				</div>
			</div>

			{status.isLoading ? <Skeleton className="h-64 w-full" /> : null}
			{status.isError ? (
				<p className="text-sm text-muted-foreground">{status.error.message}</p>
			) : null}

			{data ? (
				<div className="grid gap-3 md:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Environment</CardTitle>
							<CardDescription>{data.install_type}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-2 text-sm">
							<Row label="Version" value={data.pngx_version} />
							<Row label="Server OS" value={data.server_os} />
							<Row
								label="Storage"
								value={`${formatBytes(data.storage?.available)} free of ${formatBytes(data.storage?.total)}`}
							/>
							<div className="h-1.5 overflow-hidden rounded-full bg-muted">
								<div
									className="h-full bg-primary"
									style={{ width: `${usedPct}%` }}
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Database</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 text-sm">
							<Row label="Type" value={data.database?.type} />
							<Health
								label="Status"
								status={data.database?.status}
								detail={data.database?.error || data.database?.url}
							/>
							<Row
								label="Migrations"
								value={
									data.database?.migration_status?.unapplied_migrations?.length
										? `${data.database.migration_status.unapplied_migrations.length} pending`
										: 'Up to date'
								}
							/>
							{data.database?.migration_status?.latest_migration ? (
								<p className="font-mono text-xs text-muted-foreground">
									{data.database.migration_status.latest_migration}
								</p>
							) : null}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Tasks queue</CardTitle>
							<CardDescription>
								Last {data.tasks?.summary?.days ?? 30} days
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-2 text-sm">
							<Health
								label="Redis"
								status={data.tasks?.redis_status}
								detail={data.tasks?.redis_error || data.tasks?.redis_url}
							/>
							<Health
								label="Celery"
								status={data.tasks?.celery_status}
								detail={data.tasks?.celery_error || data.tasks?.celery_url}
							/>
							<Row
								label="Total"
								value={String(data.tasks?.summary?.total_count ?? 0)}
							/>
							<Row
								label="Successful"
								value={String(data.tasks?.summary?.success_count ?? 0)}
							/>
							<Row
								label="Failed"
								value={String(data.tasks?.summary?.failure_count ?? 0)}
							/>
							<Row
								label="Pending"
								value={String(data.tasks?.summary?.pending_count ?? 0)}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Health</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							<Health
								label="Search index"
								status={data.tasks?.index_status}
								detail={
									data.tasks?.index_error ||
									(data.tasks?.index_last_modified
										? `Updated ${new Date(data.tasks.index_last_modified).toLocaleString()}`
										: undefined)
								}
							/>
							<Health
								label="Classifier"
								status={data.tasks?.classifier_status}
								stale={isStale(data.tasks?.classifier_last_trained)}
								detail={
									data.tasks?.classifier_error ||
									(data.tasks?.classifier_last_trained
										? `Trained ${new Date(data.tasks.classifier_last_trained).toLocaleString()}`
										: undefined)
								}
								onRun={
									superuser ? () => run.mutate('train_classifier') : undefined
								}
								running={run.isPending && run.variables === 'train_classifier'}
							/>
							<Health
								label="Sanity checker"
								status={data.tasks?.sanity_check_status}
								stale={isStale(data.tasks?.sanity_check_last_run)}
								detail={
									data.tasks?.sanity_check_error ||
									(data.tasks?.sanity_check_last_run
										? `Ran ${new Date(data.tasks.sanity_check_last_run).toLocaleString()}`
										: undefined)
								}
								onRun={
									superuser ? () => run.mutate('sanity_check') : undefined
								}
								running={run.isPending && run.variables === 'sanity_check'}
							/>
							{data.tasks?.llmindex_status &&
							data.tasks.llmindex_status !== 'DISABLED' ? (
								<Health
									label="AI index"
									status={data.tasks.llmindex_status}
									stale={isStale(data.tasks.llmindex_last_modified)}
									detail={
										data.tasks.llmindex_error ||
										(data.tasks.llmindex_last_modified
											? `Updated ${new Date(data.tasks.llmindex_last_modified).toLocaleString()}`
											: undefined)
									}
									onRun={superuser ? () => run.mutate('llm_index') : undefined}
									running={run.isPending && run.variables === 'llm_index'}
								/>
							) : null}
						</CardContent>
					</Card>
				</div>
			) : null}
		</div>
	)
}

function Row({ label, value }: { label: string; value?: string | null }) {
	return (
		<div className="flex items-start justify-between gap-3">
			<span className="text-muted-foreground">{label}</span>
			<span className="text-right">{value || '—'}</span>
		</div>
	)
}

function Health({
	label,
	status,
	detail,
	stale,
	onRun,
	running,
}: {
	label: string
	status?: SystemHealth | null
	detail?: string | null
	stale?: boolean
	onRun?: () => void
	running?: boolean
}) {
	return (
		<div className="space-y-1">
			<div className="flex items-center justify-between gap-2">
				<span className="text-muted-foreground">{label}</span>
				<div className="flex items-center gap-2">
					{stale && status === 'OK' ? (
						<Badge variant="outline">Stale</Badge>
					) : null}
					<Badge variant={healthTone(status)} className="uppercase">
						{status || '—'}
					</Badge>
					{onRun ? (
						<Button
							size="xs"
							variant="outline"
							disabled={running}
							onClick={onRun}
						>
							Run
						</Button>
					) : null}
				</div>
			</div>
			{detail ? (
				<p className="font-mono text-xs text-muted-foreground">{detail}</p>
			) : null}
		</div>
	)
}
