'use client'

import { useQuery } from '@tanstack/react-query'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getDocumentHistory } from '@/lib/api/documents'
import { queryKeys } from '@/lib/query'
import { summarizeHistoryChange } from '@/lib/utils/custom-fields'

export function DocumentHistory({ documentId }: { documentId: number }) {
	const history = useQuery({
		queryKey: queryKeys.documentHistory(documentId),
		queryFn: () => getDocumentHistory(documentId),
		retry: false,
	})

	if (history.isLoading) {
		return <Skeleton className="h-40 w-full" />
	}

	if (history.isError) {
		return (
			<p className="text-sm text-muted-foreground">
				History is unavailable. Audit logging may be off, or you may not have
				permission to view it.
			</p>
		)
	}

	const entries = [...(history.data ?? [])].sort(
		(left, right) =>
			new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime()
	)
	if (!entries.length) {
		return <p className="text-sm text-muted-foreground">No history yet.</p>
	}

	return (
		<ol className="space-y-3">
			{entries.map((entry) => (
				<li key={entry.id} className="rounded-lg border p-3 text-sm">
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-muted-foreground">
							{new Date(entry.timestamp).toLocaleString()}
						</span>
						<span className="italic">{entry.actor?.username || 'System'}</span>
						<Badge variant="secondary" className="ml-auto capitalize">
							{entry.action}
						</Badge>
					</div>
					<ul className="mt-2 space-y-1 font-mono text-xs">
						{Object.entries(entry.changes ?? {}).map(([key, value]) => (
							<li key={key}>{summarizeHistoryChange(key, value)}</li>
						))}
					</ul>
				</li>
			))}
		</ol>
	)
}
