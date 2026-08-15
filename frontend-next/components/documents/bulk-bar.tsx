'use client'

import { Archive, Tag, Trash2, UserRound } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function BulkBar({
	count,
	pending,
	onClear,
	onArchive,
	onDelete,
}: {
	count: number
	pending: boolean
	onClear: () => void
	onArchive: () => void
	onDelete: () => void
}) {
	return (
		<div
			role="region"
			aria-label="Bulk actions"
			className="flex flex-wrap items-center gap-2 rounded-xl border bg-card px-3 py-2"
		>
			<p className="text-sm font-medium">{count} selected</p>
			<Button
				size="sm"
				variant="outline"
				onClick={onArchive}
				disabled={pending}
			>
				<Archive className="size-4" />
				Leave inbox
			</Button>
			<Button size="sm" variant="outline" disabled>
				<Tag className="size-4" />
				Tags
			</Button>
			<Button size="sm" variant="outline" disabled>
				<UserRound className="size-4" />
				Correspondent
			</Button>
			<Button
				size="sm"
				variant="destructive"
				onClick={onDelete}
				disabled={pending}
			>
				<Trash2 className="size-4" />
				Delete
			</Button>
			<Button size="sm" variant="ghost" onClick={onClear} className="ml-auto">
				Clear
			</Button>
		</div>
	)
}
