'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
	ArrowDown,
	ArrowUp,
	CheckSquare,
	Pencil,
	Plus,
	RotateCcw,
	RotateCw,
	Scissors,
	Square,
	Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

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
import { ScrollArea } from '@/components/ui/scroll-area'
import { editPdfDocuments } from '@/lib/api/documents'
import { queryKeys } from '@/lib/query'
import { cn } from '@/lib/utils'
import {
	createPdfPages,
	hasSelection,
	hasSplit,
	movePage,
	operationsFromPages,
	type PdfEditorEditMode,
	type PdfEditorPage,
	removePage,
	removeSelected,
	rotatePage,
	rotateSelected,
	setAllSelected,
	toggleSelected,
	toggleSplitAfter,
} from '@/lib/utils/pdf-editor'

export function PdfEditorDialog({
	open,
	onOpenChange,
	documentId,
	versionId,
	pageCount,
	documentTitle,
	defaultEditMode,
	canAdd,
	canDelete,
	onQueued,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	documentId: number
	versionId: number
	pageCount: number
	documentTitle?: string
	defaultEditMode: PdfEditorEditMode
	canAdd: boolean
	canDelete: boolean
	onQueued?: (input: { deleteOriginal: boolean }) => void
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[90vh] w-full max-w-[calc(100%-2rem)] flex-col gap-3 sm:max-w-5xl">
				<DialogHeader>
					<DialogTitle>PDF editor</DialogTitle>
					<DialogDescription>
						Rotate, delete, split, or reorder pages. Django applies the
						changes in the background.
					</DialogDescription>
				</DialogHeader>
				{open ? (
					<PdfEditorForm
						documentId={documentId}
						versionId={versionId}
						pageCount={pageCount}
						documentTitle={documentTitle}
						defaultEditMode={defaultEditMode}
						canAdd={canAdd}
						canDelete={canDelete}
						onOpenChange={onOpenChange}
						onQueued={onQueued}
					/>
				) : null}
			</DialogContent>
		</Dialog>
	)
}

function PdfEditorForm({
	documentId,
	versionId,
	pageCount,
	documentTitle,
	defaultEditMode,
	canAdd,
	canDelete,
	onOpenChange,
	onQueued,
}: {
	documentId: number
	versionId: number
	pageCount: number
	documentTitle?: string
	defaultEditMode: PdfEditorEditMode
	canAdd: boolean
	canDelete: boolean
	onOpenChange: (open: boolean) => void
	onQueued?: (input: { deleteOriginal: boolean }) => void
}) {
	const queryClient = useQueryClient()
	const [pages, setPages] = useState(() => createPdfPages(pageCount))
	const [editMode, setEditMode] = useState<PdfEditorEditMode>(
		defaultEditMode === 'update' ? 'update' : 'create'
	)
	const [includeMetadata, setIncludeMetadata] = useState(true)
	const [deleteOriginal, setDeleteOriginal] = useState(false)
	const [dragIndex, setDragIndex] = useState<number | null>(null)
	const split = hasSplit(pages)
	const selected = hasSelection(pages)
	const mode: PdfEditorEditMode = split
		? 'create'
		: !canAdd
			? 'update'
			: editMode

	const save = useMutation({
		mutationFn: () =>
			editPdfDocuments({
				documents: [versionId],
				operations: operationsFromPages(pages),
				delete_original: mode === 'create' ? deleteOriginal : false,
				update_document: mode === 'update',
				include_metadata: mode === 'create' ? includeMetadata : true,
				source_mode: 'explicit_selection',
			}),
		onSuccess: async () => {
			toast.success(
				`PDF edit for “${documentTitle ?? 'document'}” will run in the background.`
			)
			onOpenChange(false)
			onQueued?.({ deleteOriginal: mode === 'create' && deleteOriginal })
			await queryClient.invalidateQueries({
				queryKey: queryKeys.document(documentId),
			})
			await queryClient.invalidateQueries({ queryKey: ['documents'] })
			await queryClient.invalidateQueries({ queryKey: queryKeys.tasks })
		},
		onError: (error) => toast.error(error.message),
	})

	return (
		<>
			<div className="flex flex-wrap gap-2">
				<Button
					size="sm"
					variant="outline"
					onClick={() => setPages((current) => setAllSelected(current, true))}
				>
					<CheckSquare className="size-3.5" />
					Select all
				</Button>
				<Button
					size="sm"
					variant="outline"
					disabled={!selected}
					onClick={() => setPages((current) => setAllSelected(current, false))}
				>
					<Square className="size-3.5" />
					Clear
				</Button>
				<Button
					size="sm"
					variant="outline"
					disabled={!selected}
					onClick={() => setPages((current) => rotateSelected(current, -90))}
				>
					<RotateCcw className="size-3.5" />
					Rotate left
				</Button>
				<Button
					size="sm"
					variant="outline"
					disabled={!selected}
					onClick={() => setPages((current) => rotateSelected(current, 90))}
				>
					<RotateCw className="size-3.5" />
					Rotate right
				</Button>
				<Button
					size="sm"
					variant="destructive"
					disabled={!selected}
					onClick={() => setPages((current) => removeSelected(current))}
				>
					<Trash2 className="size-3.5" />
					Delete selected
				</Button>
			</div>

			{pageCount < 1 ? (
				<p className="rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
					Page count is not available yet. Wait until consume finishes, then
					open the editor again.
				</p>
			) : (
				<ScrollArea className="h-[min(50vh,28rem)]">
					<div className="grid grid-cols-2 gap-3 p-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{pages.map((page, index) => (
							<PageCard
								key={`${page.page}-${index}`}
								page={page}
								index={index}
								total={pages.length}
								dragging={dragIndex === index}
								onSelect={() =>
									setPages((current) => toggleSelected(current, index))
								}
								onRotate={(delta) =>
									setPages((current) => rotatePage(current, index, delta))
								}
								onRemove={() =>
									setPages((current) => removePage(current, index))
								}
								onSplit={() =>
									setPages((current) => toggleSplitAfter(current, index))
								}
								onMove={(to) =>
									setPages((current) => movePage(current, index, to))
								}
								onDragStart={() => setDragIndex(index)}
								onDrop={() => {
									if (dragIndex == null) return
									setPages((current) => movePage(current, dragIndex, index))
									setDragIndex(null)
								}}
								onDragEnd={() => setDragIndex(null)}
							/>
						))}
					</div>
				</ScrollArea>
			)}

			<DialogFooter className="flex-col items-stretch gap-3 sm:flex-col">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<div className="flex rounded-lg border p-0.5">
						<Button
							size="sm"
							variant={mode === 'create' ? 'secondary' : 'ghost'}
							disabled={!canAdd}
							onClick={() => setEditMode('create')}
						>
							<Plus className="size-3.5" />
							Create new document(s)
						</Button>
						<Button
							size="sm"
							variant={mode === 'update' ? 'secondary' : 'ghost'}
							disabled={split}
							onClick={() => setEditMode('update')}
							title={
								split
									? 'Splits create new documents; update is unavailable.'
									: undefined
							}
						>
							<Pencil className="size-3.5" />
							Add document version
						</Button>
					</div>
					{mode === 'create' ? (
						<div className="flex flex-wrap items-center gap-4 text-sm">
							<label className="flex items-center gap-2">
								<Checkbox
									checked={includeMetadata}
									onCheckedChange={(value) =>
										setIncludeMetadata(value === true)
									}
								/>
								Copy metadata
							</label>
							<label className="flex items-center gap-2">
								<Checkbox
									checked={deleteOriginal}
									disabled={!canDelete}
									onCheckedChange={(value) =>
										setDeleteOriginal(value === true)
									}
								/>
								Delete original
							</label>
						</div>
					) : null}
					<div className="ml-auto flex gap-2">
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={save.isPending}
						>
							Cancel
						</Button>
						<Button
							onClick={() => save.mutate()}
							disabled={
								save.isPending ||
								pages.length === 0 ||
								(mode === 'create' && !canAdd)
							}
						>
							Proceed
						</Button>
					</div>
				</div>
			</DialogFooter>
		</>
	)
}

function PageCard({
	page,
	index,
	total,
	dragging,
	onSelect,
	onRotate,
	onRemove,
	onSplit,
	onMove,
	onDragStart,
	onDrop,
	onDragEnd,
}: {
	page: PdfEditorPage
	index: number
	total: number
	dragging: boolean
	onSelect: () => void
	onRotate: (delta: number) => void
	onRemove: () => void
	onSplit: () => void
	onMove: (to: number) => void
	onDragStart: () => void
	onDrop: () => void
	onDragEnd: () => void
}) {
	return (
		<div
			className={cn(
				'relative cursor-grab rounded-xl border bg-card p-2 transition-shadow',
				page.selected && 'ring-2 ring-primary',
				page.splitAfter && 'ring-1 ring-copper',
				dragging && 'opacity-60'
			)}
			draggable
			onDragStart={(event) => {
				event.dataTransfer.effectAllowed = 'move'
				event.dataTransfer.setData('text/plain', String(index))
				onDragStart()
			}}
			onDragOver={(event) => event.preventDefault()}
			onDrop={(event) => {
				event.preventDefault()
				onDrop()
			}}
			onDragEnd={onDragEnd}
		>
			<div className="mb-2 flex items-center justify-between gap-1">
				<label className="flex items-center gap-1.5 text-xs">
					<Checkbox
						checked={Boolean(page.selected)}
						onCheckedChange={() => onSelect()}
						onClick={(event) => event.stopPropagation()}
					/>
					Page {page.page}
				</label>
				<div className="flex">
					<Button
						size="icon-xs"
						variant="ghost"
						disabled={index === 0}
						onClick={() => onMove(index - 1)}
						aria-label="Move page earlier"
					>
						<ArrowUp />
					</Button>
					<Button
						size="icon-xs"
						variant="ghost"
						disabled={index === total - 1}
						onClick={() => onMove(index + 1)}
						aria-label="Move page later"
					>
						<ArrowDown />
					</Button>
				</div>
			</div>
			<button
				type="button"
				className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-lg border bg-[repeating-linear-gradient(transparent,transparent_11px,color-mix(in_oklch,var(--paper-rule)_80%,transparent)_12px)] text-center"
				onClick={onSelect}
				aria-pressed={Boolean(page.selected)}
				aria-label={`Select page ${page.page}`}
			>
				<span
					className="font-heading text-3xl italic text-copper/80"
					style={{ transform: `rotate(${page.rotate}deg)` }}
				>
					{page.page}
				</span>
				{page.splitAfter ? (
					<span className="absolute inset-y-0 right-0 flex w-6 items-center justify-center bg-foreground/85 text-[10px] font-semibold uppercase tracking-wide text-background [writing-mode:vertical-rl]">
						Split
					</span>
				) : null}
			</button>
			<div className="mt-2 flex justify-center gap-1">
				<Button
					size="icon-xs"
					variant="outline"
					onClick={() => onRotate(-90)}
					aria-label={`Rotate page ${page.page} left`}
				>
					<RotateCcw />
				</Button>
				<Button
					size="icon-xs"
					variant="outline"
					onClick={() => onRotate(90)}
					aria-label={`Rotate page ${page.page} right`}
				>
					<RotateCw />
				</Button>
				<Button
					size="icon-xs"
					variant="destructive"
					onClick={onRemove}
					aria-label={`Delete page ${page.page}`}
				>
					<Trash2 />
				</Button>
				<Button
					size="icon-xs"
					variant={page.splitAfter ? 'secondary' : 'outline'}
					onClick={onSplit}
					aria-label={`Split after page ${page.page}`}
				>
					<Scissors />
				</Button>
			</div>
		</div>
	)
}
