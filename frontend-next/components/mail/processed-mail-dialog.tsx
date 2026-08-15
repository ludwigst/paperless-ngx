'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { bulkDeleteProcessedMail, listProcessedMail } from '@/lib/api/mail'
import { queryKeys } from '@/lib/query'
import type { MailRule } from '@/types/paperless'

export function ProcessedMailDialog({
	rule,
	open,
	onOpenChange,
}: {
	rule: MailRule | null
	open: boolean
	onOpenChange: (open: boolean) => void
}) {
	const queryClient = useQueryClient()
	const [selected, setSelected] = useState<number[]>([])
	const list = useQuery({
		queryKey: queryKeys.processedMail(rule?.id ?? 0),
		queryFn: () => listProcessedMail(rule!.id),
		enabled: open && Boolean(rule?.id),
	})

	const remove = useMutation({
		mutationFn: () => bulkDeleteProcessedMail(selected),
		onSuccess: async () => {
			toast.success('Deleted processed mail')
			setSelected([])
			if (rule) {
				await queryClient.invalidateQueries({
					queryKey: queryKeys.processedMail(rule.id),
				})
			}
		},
		onError: (error) => toast.error(error.message),
	})

	const rows = list.data?.results ?? []
	const allSelected = rows.length > 0 && selected.length === rows.length

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) setSelected([])
				onOpenChange(next)
			}}
		>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Processed mail · {rule?.name}</DialogTitle>
				</DialogHeader>
				{list.isLoading ? <Skeleton className="h-40 w-full" /> : null}
				{!list.isLoading && rows.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						No processed email messages found.
					</p>
				) : null}
				{rows.length ? (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-10">
									<Checkbox
										checked={allSelected}
										onCheckedChange={(checked) =>
											setSelected(checked ? rows.map((row) => row.id) : [])
										}
										aria-label="Select all"
									/>
								</TableHead>
								<TableHead>Subject</TableHead>
								<TableHead className="hidden sm:table-cell">
									Received
								</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{rows.map((mail) => (
								<TableRow key={mail.id}>
									<TableCell>
										<Checkbox
											checked={selected.includes(mail.id)}
											onCheckedChange={(checked) =>
												setSelected((current) =>
													checked
														? [...current, mail.id]
														: current.filter((id) => id !== mail.id)
												)
											}
											aria-label={`Select ${mail.subject ?? mail.id}`}
										/>
									</TableCell>
									<TableCell>
										<p className="font-medium">{mail.subject || '—'}</p>
										{mail.error ? (
											<p className="mt-1 font-mono text-xs text-destructive">
												{mail.error}
											</p>
										) : null}
									</TableCell>
									<TableCell className="hidden text-muted-foreground sm:table-cell">
										{mail.received
											? new Date(mail.received).toLocaleDateString()
											: '—'}
									</TableCell>
									<TableCell>
										<Badge
											variant={
												mail.status === 'FAILED' ? 'destructive' : 'secondary'
											}
										>
											{mail.status || '—'}
										</Badge>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				) : null}
				<DialogFooter>
					<Button
						variant="destructive"
						disabled={!selected.length || remove.isPending}
						onClick={() => remove.mutate()}
					>
						Delete selected
					</Button>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
