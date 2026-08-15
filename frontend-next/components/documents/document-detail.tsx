'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Download, Save } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { TagChip } from '@/components/documents/tag-chip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
	useCorrespondents,
	useCustomFields,
	useDocumentTypes,
	useStoragePaths,
	useTags,
} from '@/hooks/use-metadata'
import {
	documentDownloadUrl,
	documentPreviewUrl,
	getDocument,
	patchDocument,
} from '@/lib/api/documents'
import { queryKeys } from '@/lib/query'

export function DocumentDetail({ id }: { id: number }) {
	const queryClient = useQueryClient()
	const documentQuery = useQuery({
		queryKey: queryKeys.document(id),
		queryFn: () => getDocument(id),
	})
	const tags = useTags()
	const correspondents = useCorrespondents()
	const types = useDocumentTypes()
	const paths = useStoragePaths()
	const fields = useCustomFields()
	const [title, setTitle] = useState<string>()
	const [correspondent, setCorrespondent] = useState<number | null>()
	const [documentType, setDocumentType] = useState<number | null>()
	const [storagePath, setStoragePath] = useState<number | null>()

	const doc = documentQuery.data
	const draft = {
		title: title ?? doc?.title ?? '',
		correspondent:
			correspondent === undefined
				? (doc?.correspondent ?? null)
				: correspondent,
		document_type:
			documentType === undefined ? (doc?.document_type ?? null) : documentType,
		storage_path:
			storagePath === undefined ? (doc?.storage_path ?? null) : storagePath,
	}

	const save = useMutation({
		mutationFn: () =>
			patchDocument(id, {
				...draft,
				tags: doc?.tags ?? [],
				custom_fields: doc?.custom_fields,
				remove_inbox_tags: true,
			}),
		onSuccess: async () => {
			toast.success('Document saved')
			await queryClient.invalidateQueries({ queryKey: queryKeys.document(id) })
			await queryClient.invalidateQueries({ queryKey: ['documents'] })
		},
		onError: (error) => toast.error(error.message),
	})

	if (documentQuery.isLoading) {
		return <Skeleton className="h-[70vh] w-full" />
	}

	if (!doc) {
		return (
			<p className="text-muted-foreground">
				This document is missing or you cannot view it.
			</p>
		)
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center gap-2">
				<Button variant="ghost" asChild>
					<Link href="/documents">
						<ArrowLeft className="size-4" />
						Documents
					</Link>
				</Button>
				<div className="ml-auto flex gap-2">
					<Button variant="outline" asChild>
						<a href={documentDownloadUrl(doc.id)}>
							<Download className="size-4" />
							Download
						</a>
					</Button>
					<Button onClick={() => save.mutate()} disabled={save.isPending}>
						<Save className="size-4" />
						Save
					</Button>
				</div>
			</div>

			<div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.9fr)]">
				<div className="min-h-[60vh] overflow-hidden rounded-xl border bg-card">
					{doc.mime_type?.includes('pdf') ||
					doc.mime_type?.startsWith('image/') ? (
						<iframe
							title={doc.title ?? 'Document preview'}
							src={documentPreviewUrl(doc.id)}
							className="h-[75vh] w-full bg-muted"
						/>
					) : (
						<div className="grid h-[75vh] place-items-center p-8 text-center text-muted-foreground">
							Preview is not available for this file type. Download the
							original instead.
						</div>
					)}
				</div>

				<aside className="space-y-4 rounded-xl border bg-card p-4">
					<div className="space-y-2">
						<Label htmlFor="title">Title</Label>
						<Input
							id="title"
							value={draft.title}
							onChange={(event) => setTitle(event.target.value)}
						/>
					</div>
					<MetadataSelect
						label="Correspondent"
						value={draft.correspondent}
						options={correspondents.data?.results ?? []}
						onChange={setCorrespondent}
					/>
					<MetadataSelect
						label="Document type"
						value={draft.document_type}
						options={types.data?.results ?? []}
						onChange={setDocumentType}
					/>
					<MetadataSelect
						label="Storage path"
						value={draft.storage_path}
						options={paths.data?.results ?? []}
						onChange={setStoragePath}
					/>
					<div>
						<Label>Tags</Label>
						<div className="mt-2 flex flex-wrap gap-1">
							{doc.tags?.map((tagId) => {
								const tag = tags.data?.results.find(
									(item) => item.id === tagId
								)
								return tag ? <TagChip key={tag.id} tag={tag} /> : null
							})}
						</div>
					</div>
					<Separator />
					<dl className="grid grid-cols-2 gap-2 text-sm">
						<dt className="text-muted-foreground">Created</dt>
						<dd>
							{doc.created ? new Date(doc.created).toLocaleString() : '—'}
						</dd>
						<dt className="text-muted-foreground">Added</dt>
						<dd>{doc.added ? new Date(doc.added).toLocaleString() : '—'}</dd>
						<dt className="text-muted-foreground">Pages</dt>
						<dd>{doc.page_count ?? '—'}</dd>
						<dt className="text-muted-foreground">ASN</dt>
						<dd className="font-mono">{doc.archive_serial_number ?? '—'}</dd>
					</dl>
					{doc.content ? (
						<>
							<Separator />
							<div>
								<Label>Extracted text</Label>
								<Textarea
									readOnly
									value={doc.content}
									className="mt-2 h-40 font-mono text-xs"
								/>
							</div>
						</>
					) : null}
					{fields.data?.results.length ? (
						<>
							<Separator />
							<div className="space-y-2">
								<Label>Custom fields</Label>
								{doc.custom_fields?.map((instance) => {
									const field = fields.data?.results.find(
										(item) => item.id === instance.field
									)
									return (
										<p key={instance.id} className="text-sm">
											<span className="text-muted-foreground">
												{field?.name}:{' '}
											</span>
											{String(instance.value ?? '—')}
										</p>
									)
								})}
							</div>
						</>
					) : null}
				</aside>
			</div>
		</div>
	)
}

function MetadataSelect({
	label,
	value,
	options,
	onChange,
}: {
	label: string
	value?: number | null
	options: Array<{ id: number; name: string }>
	onChange: (value: number | null) => void
}) {
	return (
		<div className="space-y-2">
			<Label>{label}</Label>
			<Select
				value={value ? String(value) : 'none'}
				onValueChange={(next) =>
					onChange(next === 'none' ? null : Number(next))
				}
			>
				<SelectTrigger className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="none">None</SelectItem>
					{options.map((option) => (
						<SelectItem key={option.id} value={String(option.id)}>
							{option.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}
