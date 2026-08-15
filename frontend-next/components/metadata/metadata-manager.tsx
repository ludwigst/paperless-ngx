'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
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
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { createNamed, deleteNamed, updateNamed } from '@/lib/api/metadata'
import { apiFetch, toQuery } from '@/lib/api/client'
import type { MatchingModel, Paginated } from '@/types/paperless'

export function MetadataManager({
	title,
	resource,
	extraFields = [],
}: {
	title: string
	resource: string
	extraFields?: Array<{ key: string; label: string; placeholder?: string }>
}) {
	const queryClient = useQueryClient()
	const [q, setQ] = useState('')
	const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
	const [pendingDelete, setPendingDelete] = useState<MatchingModel | null>(
		null
	)

	const list = useQuery({
		queryKey: ['metadata', resource, q],
		queryFn: () =>
			apiFetch<Paginated<MatchingModel>>(
				`/api/paperless/${resource}/${toQuery({ page: 1, page_size: 100, ordering: 'name', name__icontains: q || undefined })}`
			),
	})

	const save = useMutation({
		mutationFn: async (payload: Record<string, unknown>) => {
			if (typeof payload.id === 'number') {
				return updateNamed(resource, payload.id, payload)
			}
			return createNamed(resource, payload)
		},
		onSuccess: async () => {
			toast.success('Saved')
			setEditing(null)
			await queryClient.invalidateQueries({ queryKey: ['metadata', resource] })
		},
		onError: (error) => toast.error(error.message),
	})

	const remove = useMutation({
		mutationFn: (id: number) => deleteNamed(resource, id),
		onSuccess: async () => {
			toast.success('Deleted')
			setPendingDelete(null)
			await queryClient.invalidateQueries({ queryKey: ['metadata', resource] })
		},
		onError: (error) => toast.error(error.message),
	})

	const rows = list.data?.results ?? []
	const formFields = useMemo(
		() => [
			{ key: 'name', label: 'Name', placeholder: 'Name' },
			...extraFields,
		],
		[extraFields]
	)

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<p className="text-[11px] uppercase tracking-[0.22em] text-copper">
						Metadata
					</p>
					<h1 className="font-heading text-4xl italic">{title}</h1>
				</div>
				<div className="flex gap-2">
					<Input
						value={q}
						onChange={(event) => setQ(event.target.value)}
						placeholder="Search"
						aria-label={`Search ${title}`}
						className="w-48"
					/>
					<Button onClick={() => setEditing({ name: '' })}>
						<Plus className="size-4" />
						New
					</Button>
				</div>
			</div>
			<div className="overflow-hidden rounded-xl border bg-card">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead className="hidden md:table-cell">Matching</TableHead>
							<TableHead>Used</TableHead>
							<TableHead className="w-24" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.map((row) => (
							<TableRow key={row.id}>
								<TableCell className="font-medium">{row.name}</TableCell>
								<TableCell className="hidden md:table-cell text-muted-foreground">
									{row.match || 'Automatic'}
								</TableCell>
								<TableCell>{row.document_count ?? '—'}</TableCell>
								<TableCell>
									<div className="flex justify-end gap-1">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => setEditing({ ...row })}
											aria-label={`Edit ${row.name}`}
										>
											<Pencil className="size-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => setPendingDelete(row)}
											aria-label={`Delete ${row.name}`}
										>
											<Trash2 className="size-4" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<Dialog
				open={Boolean(editing)}
				onOpenChange={(open) => !open && setEditing(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{typeof editing?.id === 'number' ? 'Edit' : 'Create'}{' '}
							{title.slice(0, -1)}
						</DialogTitle>
					</DialogHeader>
					<form
						className="space-y-3"
						onSubmit={(event) => {
							event.preventDefault()
							if (editing) save.mutate(editing)
						}}
					>
						{formFields.map((field) => (
							<div key={field.key} className="space-y-1.5">
								<Label htmlFor={field.key}>{field.label}</Label>
								<Input
									id={field.key}
									value={String(editing?.[field.key] ?? '')}
									placeholder={field.placeholder}
									onChange={(event) =>
										setEditing((current) => ({
											...current,
											[field.key]: event.target.value,
										}))
									}
								/>
							</div>
						))}
						<DialogFooter>
							<Button type="submit" disabled={save.isPending}>
								Save
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={Boolean(pendingDelete)}
				onOpenChange={(open) => !open && setPendingDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
						<AlertDialogDescription>
							This cannot be undone. Documents keep their files; only this
							metadata is removed.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => pendingDelete && remove.mutate(pendingDelete.id)}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
