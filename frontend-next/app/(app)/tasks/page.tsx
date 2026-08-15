'use client'

import { useQuery } from '@tanstack/react-query'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { listTasks } from '@/lib/api/system'
import { queryKeys } from '@/lib/query'

export default function TasksPage() {
	const tasks = useQuery({
		queryKey: queryKeys.tasks,
		queryFn: () => listTasks({ page_size: 50 }),
		refetchInterval: 5_000,
	})

	return (
		<div className="space-y-4">
			<div>
				<p className="text-[11px] uppercase tracking-[0.22em] text-copper">
					Background work
				</p>
				<h1 className="font-heading text-4xl italic">Tasks</h1>
			</div>
			<div className="grid gap-3">
				{tasks.data?.results.map((task) => (
					<Card key={task.id}>
						<CardHeader className="flex-row items-center justify-between space-y-0">
							<CardTitle className="text-base">
								{task.task_type_display || task.task_type}
							</CardTitle>
							<Badge variant="secondary">
								{task.status_display || String(task.status)}
							</Badge>
						</CardHeader>
						<CardContent className="text-sm text-muted-foreground">
							{task.date_created
								? new Date(task.date_created).toLocaleString()
								: null}
							{task.result ? (
								<p className="mt-2 font-mono text-xs">{task.result}</p>
							) : null}
						</CardContent>
					</Card>
				))}
				{!tasks.data?.results.length ? (
					<p className="text-sm text-muted-foreground">No recent tasks.</p>
				) : null}
			</div>
		</div>
	)
}
