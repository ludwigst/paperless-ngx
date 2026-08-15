'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Download, Link2, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { CustomFieldEditor } from '@/components/documents/custom-field-editor'
import { DocumentHistory } from '@/components/documents/document-history'
import { DocumentNotes } from '@/components/documents/document-notes'
import { ShareLinksDialog } from '@/components/documents/share-links-dialog'
import { TagPicker } from '@/components/documents/tag-picker'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { usePermission } from '@/hooks/use-auth'
import {
	useCorrespondents,
	useCustomFields,
	useDocumentTypes,
	useStoragePaths,
	useTags,
} from '@/hooks/use-metadata'
import {
	deleteDocument,
	documentDownloadUrl,
	documentPreviewUrl,
	getDocument,
	patchDocument,
} from '@/lib/api/documents'
import { queryKeys } from '@/lib/query'
import type { CustomFieldInstance } from '@/types/paperless'

export function DocumentDetail({ id }: { id: number }) {
	const router = useRouter()
	const queryClient = useQueryClient()
	const canShare = usePermission('add', 'sharelink')
	const canChange = usePermission('change', 'document')
	const canDelete = usePermission('delete', 'document')
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
	const [tagIds, setTagIds] = useState<number[]>()
	const [customFields, setCustomFields] = useState<CustomFieldInstance[]>()
	const [asn, setAsn] = useState<string>()
	const [shareOpen, setShareOpen] = useState(false)
	const [confirmDelete, setConfirmDelete] = useState(false)

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
		tags: tagIds ?? doc?.tags ?? [],
		custom_fields: customFields ?? doc?.custom_fields ?? [],
		archive_serial_number:
			asn === undefined
				? (doc?.archive_serial_number ?? null)
				: asn === ''
					? null
					: Number(asn),
	}

	const save = useMutation({
		mutationFn: () =>
			patchDocument(id, {
				...draft,
				custom_fields: draft.custom_fields.map((instance) => ({
					field: instance.field,
					value: instance.value,
				})),
				remove_inbox_tags: false,
			}),
		onSuccess: async () => {
			toast.success('Document saved')
			setTitle(undefined)
			setCorrespondent(undefined)
			setDocumentType(undefined)
			setStoragePath(undefined)
			setTagIds(undefined)
			setCustomFields(undefined)
			setAsn(undefined)
			await queryClient.invalidateQueries({ queryKey: queryKeys.document(id) })
			await queryClient.invalidateQueries({ queryKey: ['documents'] })
		},
		onError: (error) => toast.error(error.message),
	})

	const trash = useMutation({
		mutationFn: () => deleteDocument(id),
		onSuccess: async () => {
			toast.success('Moved to trash')
			await queryClient.invalidateQueries({ queryKey: ['documents'] })
			await queryClient.invalidateQueries({ queryKey: ['trash'] })
			router.push('/documents')
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
				<div className="ml-auto flex flex-wrap gap-2">
					{canShare ? (
						<Button variant="outline" onClick={() => setShareOpen(true)}>
							<Link2 className="size-4" />
							Share
						</Button>
					) : null}
					{doc.archived_file_name ? (
						<Button variant="outline" asChild>
							<a href={documentDownloadUrl(doc.id)}>
								<Download className="size-4" />
								Archive
							</a>
						</Button>
					) : null}
					<Button variant="outline" asChild>
						<a href={documentDownloadUrl(doc.id, true)}>
							<Download className="size-4" />
							Original
						</a>
					</Button>
					{canDelete ? (
						<Button
							variant="destructive"
							onClick={() => setConfirmDelete(true)}
						>
							<Trash2 className="size-4" />
							Trash
						</Button>
					) : null}
					<Button
						onClick={() => save.mutate()}
						disabled={!canChange || save.isPending}
					>
						<Save className="size-4" />
						Save
					</Button>
				</div>
			</div>

			<div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(22rem,0.9fr)]">
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

				<aside className="rounded-xl border bg-card p-4">
					<Tabs defaultValue="details">
						<TabsList>
							<TabsTrigger value="details">Details</TabsTrigger>
							<TabsTrigger value="notes">Notes</TabsTrigger>
							<TabsTrigger value="history">History</TabsTrigger>
						</TabsList>
						<TabsContent value="details" className="space-y-4 pt-4">
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
							<div className="space-y-2">
								<Label htmlFor="asn">Archive serial</Label>
								<Input
									id="asn"
									inputMode="numeric"
									value={
										asn ??
										(doc.archive_serial_number != null
											? String(doc.archive_serial_number)
											: '')
									}
									onChange={(event) => setAsn(event.target.value)}
								/>
							</div>
							<div>
								<Label>Tags</Label>
								<div className="mt-2">
									<TagPicker
										tags={tags.data?.results ?? []}
										selected={draft.tags}
										onChange={setTagIds}
									/>
								</div>
							</div>
							<Separator />
							<dl className="grid grid-cols-2 gap-2 text-sm">
								<dt className="text-muted-foreground">Created</dt>
								<dd>
									{doc.created ? new Date(doc.created).toLocaleString() : '—'}
								</dd>
								<dt className="text-muted-foreground">Added</dt>
								<dd>
									{doc.added ? new Date(doc.added).toLocaleString() : '—'}
								</dd>
								<dt className="text-muted-foreground">Pages</dt>
								<dd>{doc.page_count ?? '—'}</dd>
								<dt className="text-muted-foreground">File</dt>
								<dd className="truncate font-mono text-xs">
									{doc.original_file_name ?? doc.mime_type ?? '—'}
								</dd>
							</dl>
							{doc.content ? (
								<>
									<Separator />
									<div>
										<Label>Extracted text</Label>
										<Textarea
											readOnly
											value={doc.content}
											className="mt-2 h-32 font-mono text-xs"
										/>
									</div>
								</>
							) : null}
							{fields.data?.results.length ? (
								<>
									<Separator />
									<div className="space-y-2">
										<Label>Custom fields</Label>
										<CustomFieldEditor
											definitions={fields.data.results}
											instances={draft.custom_fields}
											onChange={setCustomFields}
										/>
									</div>
								</>
							) : null}
						</TabsContent>
						<TabsContent value="notes" className="pt-4">
							<DocumentNotes documentId={id} notes={doc.notes ?? []} />
						</TabsContent>
						<TabsContent value="history" className="pt-4">
							<DocumentHistory documentId={id} />
						</TabsContent>
					</Tabs>
				</aside>
			</div>

			<ShareLinksDialog
				documentId={id}
				open={shareOpen}
				onOpenChange={setShareOpen}
				hasArchive={Boolean(doc.archived_file_name)}
			/>

			<AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Move to trash?</AlertDialogTitle>
						<AlertDialogDescription>
							The document can be restored from Trash until it expires.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={() => trash.mutate()}>
							Move to trash
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
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
