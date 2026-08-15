'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { usePermission } from '@/hooks/use-auth'
import { addDocumentNote, deleteDocumentNote } from '@/lib/api/documents'
import { queryKeys } from '@/lib/query'
import { displayName } from '@/lib/utils/search-params'
import type { DocumentNote, User } from '@/types/paperless'

export function DocumentNotes({
	documentId,
	notes,
}: {
	documentId: number
	notes: DocumentNote[]
}) {
	const canAdd = usePermission('add', 'note')
	const canDelete = usePermission('delete', 'note')
	const [draft, setDraft] = useState('')
	const queryClient = useQueryClient()

	async function refresh() {
		await queryClient.invalidateQueries({
			queryKey: queryKeys.document(documentId),
		})
	}

	const add = useMutation({
		mutationFn: () => addDocumentNote(documentId, draft.trim()),
		onSuccess: async () => {
			setDraft('')
			toast.success('Note added')
			await refresh()
		},
		onError: (error) => toast.error(error.message),
	})

	const remove = useMutation({
		mutationFn: (noteId: number) => deleteDocumentNote(documentId, noteId),
		onSuccess: async () => {
			toast.success('Note deleted')
			await refresh()
		},
		onError: (error) => toast.error(error.message),
	})

	return (
		<div className="space-y-4">
			{canAdd ? (
				<div className="space-y-2">
					<Textarea
						value={draft}
						onChange={(event) => setDraft(event.target.value)}
						placeholder="Add a note about this document"
						rows={3}
					/>
					<div className="flex justify-end">
						<Button
							size="sm"
							disabled={!draft.trim() || add.isPending}
							onClick={() => add.mutate()}
						>
							Add note
						</Button>
					</div>
				</div>
			) : null}
			{notes.length === 0 ? (
				<p className="text-sm text-muted-foreground">No notes yet.</p>
			) : (
				<ul className="space-y-3">
					{notes.map((note) => {
						const user =
							note.user && typeof note.user === 'object'
								? (note.user as User)
								: undefined
						return (
							<li
								key={note.id}
								className="rounded-lg border bg-background p-3 text-sm"
							>
								<p className="whitespace-pre-wrap">{note.note}</p>
								<div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
									<span>
										{displayName(
											user?.first_name,
											user?.last_name,
											user?.username
										)}
										{note.created
											? ` · ${new Date(note.created).toLocaleString()}`
											: ''}
									</span>
									{canDelete ? (
										<Button
											variant="ghost"
											size="xs"
											onClick={() => remove.mutate(note.id)}
										>
											Delete
										</Button>
									) : null}
								</div>
							</li>
						)
					})}
				</ul>
			)}
		</div>
	)
}
