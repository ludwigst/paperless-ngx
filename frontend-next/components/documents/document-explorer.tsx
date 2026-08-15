'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BookmarkPlus, Download, Loader2, Search, Upload } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { BulkBar } from '@/components/documents/bulk-bar'
import { DocumentFilters } from '@/components/documents/document-filters'
import { TagChip } from '@/components/documents/tag-chip'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { useUiSettings } from '@/hooks/use-auth'
import { useDocuments } from '@/hooks/use-documents'
import {
	lookupName,
	useCorrespondents,
	useDocumentTypes,
	useSavedView,
	useTags,
} from '@/hooks/use-metadata'
import {
	bulkDeleteDocuments,
	bulkEditDocuments,
	documentThumbUrl,
	uploadDocument,
} from '@/lib/api/documents'
import { createSavedView, updateSavedView } from '@/lib/api/metadata'
import { saveUiSettings } from '@/lib/api/system'
import { queryKeys } from '@/lib/query'
import { cn } from '@/lib/utils'
import {
	filterRulesFromQuery,
	queryParamsFromFilterRules,
} from '@/lib/utils/filter-rules'
import {
	patchSavedViewVisibility,
	savedViewVisibility,
	toggleId,
} from '@/lib/utils/saved-views'
import { searchParamsToQuery } from '@/lib/utils/search-params'
import type { BulkEditMethod } from '@/types/paperless'

export function DocumentExplorer({
	inbox = false,
	viewId,
}: {
	inbox?: boolean
	viewId?: number
}) {
	const router = useRouter()
	const searchParams = useSearchParams()
	const viewFromQuery = Number(searchParams.get('view') || '') || undefined
	const activeViewId = viewId ?? viewFromQuery
	const params = useMemo(() => {
		const next = new URLSearchParams(searchParams.toString())
		if (inbox) next.set('inbox', '1')
		return next
	}, [inbox, searchParams])
	const savedView = useSavedView(activeViewId)
	const documents = useDocuments(params, savedView.data)
	const tags = useTags()
	const correspondents = useCorrespondents()
	const types = useDocumentTypes()
	const ui = useUiSettings()
	const [selected, setSelected] = useState<number[]>([])
	const [saveOpen, setSaveOpen] = useState(false)
	const [viewName, setViewName] = useState('')
	const [showInSidebar, setShowInSidebar] = useState(true)
	const [showOnDashboard, setShowOnDashboard] = useState(false)
	const queryClient = useQueryClient()
	const basePath = activeViewId
		? `/view/${activeViewId}`
		: inbox
			? '/inbox'
			: '/documents'

	const results = documents.data?.results ?? []
	const count = documents.data?.count ?? 0
	const page = Number(params.get('page') ?? '1')
	const pageSize = Number(
		params.get('page_size') ?? savedView.data?.page_size ?? '25'
	)
	const pageCount = Math.max(1, Math.ceil(count / pageSize))

	function setParam(key: string, value?: string) {
		const next = new URLSearchParams(searchParams.toString())
		if (!value) next.delete(key)
		else next.set(key, value)
		if (key !== 'page') next.delete('page')
		next.delete('view')
		router.push(`${basePath}?${next.toString()}`)
	}

	function currentViewPayload() {
		const merged = {
			...queryParamsFromFilterRules(savedView.data?.filter_rules),
			...searchParamsToQuery(params),
		}
		const ordering = params.get('ordering')
		const reverse = params.get('reverse')
		const sortField =
			ordering?.replace(/^-/, '') || savedView.data?.sort_field || 'created'
		const sortReverse = ordering
			? reverse === '1' || ordering.startsWith('-')
			: (savedView.data?.sort_reverse ?? true)
		return {
			filter_rules: filterRulesFromQuery(merged),
			sort_field: sortField,
			sort_reverse: sortReverse,
			page_size: Number(
				params.get('page_size') ?? savedView.data?.page_size ?? 25
			),
		}
	}

	async function persistVisibility(
		viewNumericId: number,
		sidebar: boolean,
		dashboard: boolean
	) {
		const current = ui.data?.settings ?? {}
		const visibility = savedViewVisibility(current)
		await saveUiSettings(
			patchSavedViewVisibility(current, {
				sidebarIds: toggleId(visibility.sidebarIds, viewNumericId, sidebar),
				dashboardIds: toggleId(
					visibility.dashboardIds,
					viewNumericId,
					dashboard
				),
			})
		)
		await queryClient.invalidateQueries({ queryKey: queryKeys.uiSettings })
		await queryClient.invalidateQueries({ queryKey: queryKeys.savedViews })
	}

	const saveExisting = useMutation({
		mutationFn: async () => {
			if (!activeViewId) throw new Error('No saved view selected')
			return updateSavedView(activeViewId, currentViewPayload())
		},
		onSuccess: async () => {
			toast.success('View updated')
			await queryClient.invalidateQueries({ queryKey: queryKeys.savedViews })
			await queryClient.invalidateQueries({
				queryKey: queryKeys.savedView(activeViewId ?? 0),
			})
		},
		onError: (error) => toast.error(error.message),
	})

	const saveAs = useMutation({
		mutationFn: async () => {
			const created = await createSavedView({
				name: viewName.trim() || 'Untitled view',
				...currentViewPayload(),
			})
			await persistVisibility(created.id, showInSidebar, showOnDashboard)
			return created
		},
		onSuccess: async (created) => {
			toast.success('View saved')
			setSaveOpen(false)
			setViewName('')
			router.push(`/view/${created.id}`)
		},
		onError: (error) => toast.error(error.message),
	})

	const bulk = useMutation({
		mutationFn: async (input: {
			method: BulkEditMethod | 'delete'
			parameters?: Record<string, unknown>
		}) => {
			if (input.method === 'delete') {
				return bulkDeleteDocuments(selected)
			}
			return bulkEditDocuments({
				documents: selected,
				method: input.method,
				parameters: input.parameters,
			})
		},
		onSuccess: async () => {
			toast.success('Bulk action queued')
			setSelected([])
			await queryClient.invalidateQueries({ queryKey: ['documents'] })
			await queryClient.invalidateQueries({ queryKey: queryKeys.tasks })
		},
		onError: (error) => toast.error(error.message),
	})

	async function onPickFiles(files: FileList | null) {
		if (!files?.length) return
		for (const file of Array.from(files)) {
			try {
				await uploadDocument(file)
				toast.success(`${file.name} queued`)
			} catch (error) {
				toast.error(error instanceof Error ? error.message : 'Upload failed')
			}
		}
		await queryClient.invalidateQueries({ queryKey: ['documents'] })
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<p className="text-[11px] uppercase tracking-[0.22em] text-copper">
						{inbox
							? 'Needs attention'
							: activeViewId
								? 'Saved view'
								: 'Collection'}
					</p>
					<h1 className="font-heading text-4xl italic tracking-tight">
						{inbox
							? 'Inbox'
							: savedView.data?.name ||
								(activeViewId ? 'Saved view' : 'Documents')}
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						{documents.isLoading
							? 'Loading…'
							: `${count.toLocaleString()} in this view`}
					</p>
				</div>
				<div className="flex items-center gap-2">
					{activeViewId ? (
						<Button
							variant="outline"
							onClick={() => saveExisting.mutate()}
							disabled={saveExisting.isPending}
						>
							Save view
						</Button>
					) : null}
					<Button
						variant="outline"
						onClick={() => {
							setViewName(
								savedView.data?.name ? `${savedView.data.name} copy` : ''
							)
							setSaveOpen(true)
						}}
					>
						<BookmarkPlus className="size-4" />
						Save as
					</Button>
					<Button variant="outline" asChild>
						<label className="cursor-pointer">
							<Upload className="size-4" />
							Upload
							<input
								type="file"
								className="sr-only"
								multiple
								onChange={(event) => {
									void onPickFiles(event.target.files)
									event.target.value = ''
								}}
							/>
						</label>
					</Button>
				</div>
			</div>

			<DocumentFilters params={params} onChange={setParam} />

			{selected.length > 0 ? (
				<BulkBar
					count={selected.length}
					pending={bulk.isPending}
					onClear={() => setSelected([])}
					onArchive={() => {
						const inboxTags =
							tags.data?.results
								.filter((tag) => tag.is_inbox_tag)
								.map((tag) => tag.id) ?? []
						bulk.mutate({
							method: 'modify_tags',
							parameters: { add_tags: [], remove_tags: inboxTags },
						})
					}}
					onDelete={() => {
						if (confirm(`Delete ${selected.length} documents?`)) {
							bulk.mutate({ method: 'delete' })
						}
					}}
				/>
			) : null}

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
							<TableHead className="w-16">Preview</TableHead>
							<TableHead>Title</TableHead>
							<TableHead className="hidden md:table-cell">
								Correspondent
							</TableHead>
							<TableHead className="hidden lg:table-cell">Type</TableHead>
							<TableHead>Created</TableHead>
							<TableHead className="w-12" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{documents.isLoading
							? Array.from({ length: 8 }).map((_, index) => (
									<TableRow key={index}>
										<TableCell colSpan={7}>
											<Skeleton className="h-12 w-full" />
										</TableCell>
									</TableRow>
								))
							: null}
						{!documents.isLoading && results.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={7}
									className="py-16 text-center text-muted-foreground"
								>
									<Search className="mx-auto mb-3 size-6 opacity-50" />
									No documents match this view.
								</TableCell>
							</TableRow>
						) : null}
						{results.map((doc) => {
							const checked = selected.includes(doc.id)
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
										{/* Authenticated preview bytes come from the Paperless proxy, not a public CDN. */}
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={documentThumbUrl(doc.id)}
											alt=""
											className="h-12 w-10 rounded object-cover ring-1 ring-border"
										/>
									</TableCell>
									<TableCell>
										<Link
											href={`/documents/${doc.id}`}
											className="font-medium hover:underline"
										>
											{doc.title || `Document ${doc.id}`}
										</Link>
										<div className="mt-1 flex flex-wrap gap-1">
											{doc.tags?.map((tagId) => {
												const tag = tags.data?.results.find(
													(item) => item.id === tagId
												)
												return tag ? <TagChip key={tagId} tag={tag} /> : null
											})}
										</div>
									</TableCell>
									<TableCell className="hidden md:table-cell text-muted-foreground">
										{lookupName(
											correspondents.data?.results,
											doc.correspondent
										) ?? '—'}
									</TableCell>
									<TableCell className="hidden lg:table-cell text-muted-foreground">
										{lookupName(types.data?.results, doc.document_type) ?? '—'}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{doc.created
											? new Date(doc.created).toLocaleDateString()
											: '—'}
									</TableCell>
									<TableCell>
										<Button variant="ghost" size="icon" asChild>
											<a
												href={`/api/paperless/documents/${doc.id}/download/`}
												aria-label="Download"
											>
												<Download className="size-4" />
											</a>
										</Button>
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
						onClick={() => setParam('page', String(page - 1))}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						disabled={page >= pageCount}
						onClick={() => setParam('page', String(page + 1))}
					>
						Next
					</Button>
				</div>
			</div>
			{documents.isFetching && !documents.isLoading ? (
				<p
					className={cn(
						'flex items-center gap-2 text-xs text-muted-foreground'
					)}
				>
					<Loader2 className="size-3 animate-spin" /> Refreshing
				</p>
			) : null}

			<Dialog open={saveOpen} onOpenChange={setSaveOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Save this view</DialogTitle>
						<DialogDescription>
							Stores the current filters and sort as a reusable saved view.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-3">
						<div className="space-y-1.5">
							<Label htmlFor="view-name">Name</Label>
							<Input
								id="view-name"
								value={viewName}
								onChange={(event) => setViewName(event.target.value)}
								placeholder="Invoices this quarter"
							/>
						</div>
						<label className="flex items-center gap-2 text-sm">
							<Checkbox
								checked={showInSidebar}
								onCheckedChange={(checked) =>
									setShowInSidebar(Boolean(checked))
								}
							/>
							Show in sidebar
						</label>
						<label className="flex items-center gap-2 text-sm">
							<Checkbox
								checked={showOnDashboard}
								onCheckedChange={(checked) =>
									setShowOnDashboard(Boolean(checked))
								}
							/>
							Show on dashboard
						</label>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setSaveOpen(false)}>
							Cancel
						</Button>
						<Button
							onClick={() => saveAs.mutate()}
							disabled={saveAs.isPending}
						>
							Save
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
