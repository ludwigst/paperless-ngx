'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Copy, Link2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	createShareLink,
	deleteShareLink,
	expirationFromDays,
	listShareLinks,
	shareLinkUrl,
} from '@/lib/api/share-links'
import { queryKeys } from '@/lib/query'

const EXPIRATION = [
	{ label: '1 day', value: '1' },
	{ label: '7 days', value: '7' },
	{ label: '30 days', value: '30' },
	{ label: 'Never', value: 'never' },
]

export function ShareLinksDialog({
	documentId,
	open,
	onOpenChange,
	hasArchive,
}: {
	documentId: number
	open: boolean
	onOpenChange: (open: boolean) => void
	hasArchive: boolean
}) {
	const queryClient = useQueryClient()
	const [days, setDays] = useState('7')
	const [fileVersion, setFileVersion] = useState<'archive' | 'original'>(
		hasArchive ? 'archive' : 'original'
	)
	const links = useQuery({
		queryKey: queryKeys.shareLinks(documentId),
		queryFn: () => listShareLinks(documentId),
		enabled: open,
	})

	const create = useMutation({
		mutationFn: () =>
			createShareLink({
				document: documentId,
				file_version: fileVersion,
				expiration: expirationFromDays(days === 'never' ? null : Number(days)),
			}),
		onSuccess: async () => {
			toast.success('Share link created')
			await queryClient.invalidateQueries({
				queryKey: queryKeys.shareLinks(documentId),
			})
		},
		onError: (error) => toast.error(error.message),
	})

	const remove = useMutation({
		mutationFn: (id: number) => deleteShareLink(id),
		onSuccess: async () => {
			toast.success('Share link deleted')
			await queryClient.invalidateQueries({
				queryKey: queryKeys.shareLinks(documentId),
			})
		},
		onError: (error) => toast.error(error.message),
	})

	async function copy(slug: string) {
		try {
			await navigator.clipboard.writeText(shareLinkUrl(slug))
			toast.success('Link copied')
		} catch {
			toast.error('Could not copy the link')
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Share links</DialogTitle>
					<DialogDescription>
						Anyone with the link can download this document until it expires.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-3">
					<div className="grid grid-cols-2 gap-2">
						<div className="space-y-1.5">
							<Label>Expires</Label>
							<Select value={days} onValueChange={setDays}>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{EXPIRATION.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1.5">
							<Label>File</Label>
							<Select
								value={fileVersion}
								onValueChange={(value) =>
									setFileVersion(value as 'archive' | 'original')
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{hasArchive ? (
										<SelectItem value="archive">Archive</SelectItem>
									) : null}
									<SelectItem value="original">Original</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<Button onClick={() => create.mutate()} disabled={create.isPending}>
						<Link2 className="size-4" />
						Create link
					</Button>
					<ul className="space-y-2">
						{(links.data ?? []).map((link) => (
							<li
								key={link.id}
								className="flex items-center gap-2 rounded-lg border p-2 text-xs"
							>
								<div className="min-w-0 flex-1">
									<p className="truncate font-mono">
										{shareLinkUrl(link.slug)}
									</p>
									<p className="text-muted-foreground">
										{link.file_version}
										{link.expiration
											? ` · expires ${new Date(link.expiration).toLocaleDateString()}`
											: ' · never expires'}
									</p>
								</div>
								<Button
									variant="ghost"
									size="icon-xs"
									aria-label="Copy"
									onClick={() => void copy(link.slug)}
								>
									<Copy className="size-3.5" />
								</Button>
								<Button
									variant="ghost"
									size="icon-xs"
									aria-label="Delete"
									onClick={() => remove.mutate(link.id)}
								>
									<Trash2 className="size-3.5" />
								</Button>
							</li>
						))}
					</ul>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
