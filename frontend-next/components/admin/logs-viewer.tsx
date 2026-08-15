'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUiSettings } from '@/hooks/use-auth'
import { getLogFile, listLogFiles } from '@/lib/api/system'
import { canViewLogs } from '@/lib/auth/permissions'
import { queryKeys } from '@/lib/query'
import {
	clampLogLimit,
	logLevelClass,
	parseLogLevel,
} from '@/lib/utils/system'

export function LogsViewer() {
	const ui = useUiSettings()
	const allowed = canViewLogs(ui.data?.user)
	const [limit, setLimit] = useState(5000)
	const [autoRefresh, setAutoRefresh] = useState(true)
	const [active, setActive] = useState<string>()
	const [showJump, setShowJump] = useState(false)
	const scroller = useRef<HTMLDivElement>(null)

	const files = useQuery({
		queryKey: queryKeys.logs,
		queryFn: listLogFiles,
		enabled: allowed,
	})
	const logKey = active ?? files.data?.[0]
	const lines = useQuery({
		queryKey: queryKeys.logFile(logKey ?? '', clampLogLimit(limit)),
		queryFn: () => getLogFile(logKey as string, clampLogLimit(limit)),
		enabled: allowed && Boolean(logKey),
		refetchInterval: autoRefresh ? 5_000 : false,
	})

	useEffect(() => {
		const node = scroller.current
		if (!node || showJump) return
		node.scrollTop = node.scrollHeight
	}, [lines.data, showJump])

	function onScroll() {
		const node = scroller.current
		if (!node) return
		const distance = node.scrollHeight - node.scrollTop - node.clientHeight
		setShowJump(distance > 40)
	}

	if (ui.isLoading) return <Skeleton className="h-64 w-full" />
	if (!allowed) {
		return (
			<p className="text-muted-foreground">
				Logs are available to staff accounts.
			</p>
		)
	}

	const parsed = (lines.data ?? []).map((message) => ({
		message,
		level: parseLogLevel(message),
	}))

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<p className="text-[11px] uppercase tracking-[0.22em] text-copper">
						Administration
					</p>
					<h1 className="font-heading text-4xl italic">Logs</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Paperless, mail, and Celery log files from the Django server.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<div className="space-y-1">
						<Label htmlFor="log-limit">Lines</Label>
						<Input
							id="log-limit"
							type="number"
							min={100}
							step={100}
							className="w-28"
							value={limit}
							onChange={(event) => setLimit(Number(event.target.value))}
						/>
					</div>
					<div className="flex items-center gap-2 pt-5">
						<Switch
							id="log-refresh"
							checked={autoRefresh}
							onCheckedChange={setAutoRefresh}
						/>
						<Label htmlFor="log-refresh">Auto refresh</Label>
					</div>
				</div>
			</div>

			{files.data?.length ? (
				<Tabs value={logKey} onValueChange={setActive}>
					<TabsList>
						{files.data.map((file) => (
							<TabsTrigger key={file} value={file}>
								{file}.log
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>
			) : null}

			{files.isLoading ? <Skeleton className="h-96 w-full" /> : null}
			{!files.isLoading && !files.data?.length ? (
				<p className="text-sm text-muted-foreground">
					No log files are available on this server.
				</p>
			) : null}

			{logKey ? (
				<div className="relative">
					<div
						ref={scroller}
						onScroll={onScroll}
						className="h-[70vh] overflow-auto rounded-xl bg-zinc-950 p-4 font-mono text-xs leading-5"
					>
						{parsed.map((entry, index) => (
							<p
								key={`${index}-${entry.message.slice(0, 24)}`}
								className={logLevelClass(entry.level)}
							>
								{entry.message}
							</p>
						))}
						{!parsed.length && !lines.isLoading ? (
							<p className="text-zinc-500">This log file is empty.</p>
						) : null}
					</div>
					{showJump ? (
						<Button
							size="sm"
							className="absolute right-4 bottom-4"
							onClick={() => {
								setShowJump(false)
								const node = scroller.current
								if (node) node.scrollTop = node.scrollHeight
							}}
						>
							Jump to bottom
						</Button>
					) : null}
				</div>
			) : null}
		</div>
	)
}
