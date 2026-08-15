'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RotateCcw, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { usePermission, useUiSettings } from '@/hooks/use-auth'
import { emptyTrash, listTrash, restoreTrash } from '@/lib/api/trash'
import { queryKeys } from '@/lib/query'
import { trashDaysRemaining } from '@/lib/utils/saved-views'

export function TrashExplorer() {
	const canDelete = usePermission('delete', 'document')
	const ui = useUiSettings()
	const delay = Number(ui.data?.settings?.trash_delay ?? 30)
	const [page, setPage] = useState(1)
	const [selected, setSelected] = useState<number[]>([])
	const [confirmEmpty, setConfirmEmpty] = useState<'selected' | 'all' | null>(
		null
	)
	const queryClient = useQueryClient()
	const trash = useQuery({
		queryKey: queryKeys.trash({ page }),
		queryFn: () => listTrash(page),
		enabled: canDelete,
	})

	const results = trash.data?.results ?? []
	const count = trash.data?.count ?? 0
	const pageCount = Math.max(1, Math.ceil(count / 25))

	async function invalidate() {
		setSelected([])
		await queryClient.invalidateQueries({ queryKey: ['trash'] })
		await queryClient.invalidateQueries({ queryKey: ['documents'] })
	}

	const restore = useMutation({
		mutationFn: (documents: number[]) => restoreTrash(documents),
		onSuccess: async (_, documents) => {
			toast.success(
				documents.length === 1 ? 'Document restored' : 'Documents restored'
			)
			await invalidate()
		},
		onError: (error) => toast.error(error.message),
	})

	const destroy = useMutation({
		mutationFn: (documents?: number[]) => emptyTrash(documents),
		onSuccess: async () => {
			toast.success('Documents permanently deleted')
			setConfirmEmpty(null)
			await invalidate()
		},
		onError: (error) => toast.error(error.message),
	})

	if (ui.isLoading) {
		return <Skeleton className="h-64 w-full" />
	}

	if (!canDelete) {
		return (
			<div className="space-y-2">
				<h1 className="font-heading text-4xl italic">Trash</h1>
				<p className="text-sm text-muted-foreground">
					You need permission to delete documents to open the trash.
				</p>
			</div>
		)
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<p className="text-[11px] uppercase tracking-[0.22em] text-copper">
						Recovery
					</p>
					<h1 className="font-heading text-4xl italic tracking-tight">
						Trash
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						{trash.isLoading
							? 'Loading…'
							: `${count.toLocaleString()} documents waiting to expire`}
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						disabled={!selected.length || restore.isPending}
						onClick={() => restore.mutate(selected)}
					>
						<RotateCcw className="size-4" />
						Restore
					</Button>
					<Button
						variant="destructive"
						disabled={!selected.length || destroy.isPending}
						onClick={() => setConfirmEmpty('selected')}
					>
						<Trash2 className="size-4" />
						Delete forever
					</Button>
					<Button
						variant="destructive"
						disabled={!count || destroy.isPending}
						onClick={() => setConfirmEmpty('all')}
					>
						Empty trash
					</Button>
				</div>
			</div>

			<div className="overflow-hidden rounded-xl border bg-card">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-10">
								<Checkbox
									aria-label="Select all on this page"
									checked={
										results.length > 0 && selected.length === results.length
									}
									onCheckedChange={(checked) => {
										setSelected(checked ? results.map((doc) => doc.id) : [])
									}}
								/>
							</TableHead>
							<TableHead>Title</TableHead>
							<TableHead>Deleted</TableHead>
							<TableHead>Days left</TableHead>
							<TableHead className="w-40" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{trash.isLoading
							? Array.from({ length: 6 }).map((_, index) => (
									<TableRow key={index}>
										<TableCell colSpan={5}>
											<Skeleton className="h-10 w-full" />
										</TableCell>
									</TableRow>
								))
							: null}
						{!trash.isLoading && results.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="py-16 text-center text-muted-foreground"
								>
									Trash is empty.
								</TableCell>
							</TableRow>
						) : null}
						{results.map((doc) => {
							const checked = selected.includes(doc.id)
							const remaining = trashDaysRemaining(doc.deleted_at, delay)
							return (
								<TableRow
									key={doc.id}
									data-state={checked ? 'selected' : undefined}
								>
									<TableCell>
										<Checkbox
											aria-label={`Select ${doc.title ?? doc.id}`}
											checked={checked}
											onCheckedChange={(value) => {
												setSelected((current) =>
													value
														? [...current, doc.id]
														: current.filter((id) => id !== doc.id)
												)
											}}
										/>
									</TableCell>
									<TableCell>
										<Link
											href={`/documents/${doc.id}`}
											className="font-medium hover:underline"
										>
											{doc.title || `Document ${doc.id}`}
										</Link>
									</TableCell>
									<TableCell className="text-muted-foreground">
										{doc.deleted_at
											? new Date(doc.deleted_at).toLocaleString()
											: '—'}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{remaining == null ? '—' : Math.max(0, remaining)}
									</TableCell>
									<TableCell>
										<div className="flex justify-end gap-1">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => restore.mutate([doc.id])}
											>
												Restore
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => {
													setSelected([doc.id])
													setConfirmEmpty('selected')
												}}
											>
												Delete
											</Button>
										</div>
									</TableCell>
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-between text-sm text-muted-foreground">
				<p>
					Page {page} of {pageCount}
				</p>
				<div className="flex gap-2">
					<Button
						variant="outline"
						disabled={page <= 1}
						onClick={() => setPage((value) => value - 1)}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						disabled={page >= pageCount}
						onClick={() => setPage((value) => value + 1)}
					>
						Next
					</Button>
				</div>
			</div>

			<AlertDialog
				open={confirmEmpty !== null}
				onOpenChange={(open) => {
					if (!open) setConfirmEmpty(null)
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Permanently delete?</AlertDialogTitle>
						<AlertDialogDescription>
							{confirmEmpty === 'all'
								? 'This permanently deletes every document in the trash. It cannot be undone.'
								: 'This permanently deletes the selected documents. It cannot be undone.'}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() =>
								destroy.mutate(confirmEmpty === 'all' ? undefined : selected)
							}
						>
							Delete forever
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
