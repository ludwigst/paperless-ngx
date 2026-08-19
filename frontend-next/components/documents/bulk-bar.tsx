'use client'

import { useState } from 'react'
import {
	Archive,
	FolderTree,
	LayoutDashboard,
	Tag,
	Trash2,
	UserRound,
} from 'lucide-react'

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
import { bulkAssignMessage, bulkTagsMessage } from '@/lib/utils/bulk-edit'
import type {
	BulkEditMethod,
	Correspondent,
	DocumentType,
	StoragePath,
	Tag as TagType,
} from '@/types/paperless'

type PendingEdit = {
	title: string
	message: string
	method: BulkEditMethod | 'delete'
	parameters?: Record<string, unknown>
}

export function BulkBar({
	count,
	pending,
	confirm,
	tags,
	correspondents,
	documentTypes,
	storagePaths,
	canChange,
	canViewTags,
	canViewCorrespondents,
	canViewTypes,
	canViewPaths,
	onClear,
	onEdit,
}: {
	count: number
	pending: boolean
	confirm: boolean
	tags: TagType[]
	correspondents: Correspondent[]
	documentTypes: DocumentType[]
	storagePaths: StoragePath[]
	canChange: boolean
	canViewTags: boolean
	canViewCorrespondents: boolean
	canViewTypes: boolean
	canViewPaths: boolean
	onClear: () => void
	onEdit: (input: {
		method: BulkEditMethod | 'delete'
		parameters?: Record<string, unknown>
	}) => void
}) {
	const [tagsOpen, setTagsOpen] = useState(false)
	const [assignOpen, setAssignOpen] = useState<
		null | 'correspondent' | 'document type' | 'storage path'
	>(null)
	const [pendingEdit, setPendingEdit] = useState<PendingEdit | null>(null)

	function runOrConfirm(edit: PendingEdit) {
		if (confirm) setPendingEdit(edit)
		else onEdit({ method: edit.method, parameters: edit.parameters })
	}

	const inboxTags = tags.filter((tag) => tag.is_inbox_tag).map((tag) => tag.id)

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
				onClick={() =>
					runOrConfirm({
						title: 'Leave inbox',
						message: `Remove inbox tags from ${count} selected document${count === 1 ? '' : 's'}?`,
						method: 'modify_tags',
						parameters: { add_tags: [], remove_tags: inboxTags },
					})
				}
				disabled={pending || !canChange || inboxTags.length === 0}
			>
				<Archive className="size-4" />
				Leave inbox
			</Button>
			{canViewTags ? (
				<Button
					size="sm"
					variant="outline"
					disabled={pending || !canChange}
					onClick={() => setTagsOpen(true)}
				>
					<Tag className="size-4" />
					Tags
				</Button>
			) : null}
			{canViewCorrespondents ? (
				<Button
					size="sm"
					variant="outline"
					disabled={pending || !canChange}
					onClick={() => setAssignOpen('correspondent')}
				>
					<UserRound className="size-4" />
					Correspondent
				</Button>
			) : null}
			{canViewTypes ? (
				<Button
					size="sm"
					variant="outline"
					disabled={pending || !canChange}
					onClick={() => setAssignOpen('document type')}
				>
					<LayoutDashboard className="size-4" />
					Type
				</Button>
			) : null}
			{canViewPaths ? (
				<Button
					size="sm"
					variant="outline"
					disabled={pending || !canChange}
					onClick={() => setAssignOpen('storage path')}
				>
					<FolderTree className="size-4" />
					Path
				</Button>
			) : null}
			<Button
				size="sm"
				variant="destructive"
				onClick={() =>
					runOrConfirm({
						title: 'Delete documents',
						message: `Delete ${count} selected document${count === 1 ? '' : 's'}? They can be restored from Trash.`,
						method: 'delete',
					})
				}
				disabled={pending}
			>
				<Trash2 className="size-4" />
				Delete
			</Button>
			<Button size="sm" variant="ghost" onClick={onClear} className="ml-auto">
				Clear
			</Button>

			<TagsDialog
				open={tagsOpen}
				onOpenChange={setTagsOpen}
				tags={tags}
				count={count}
				onApply={(add, remove) => {
					const addNames = add
						.map((id) => tags.find((tag) => tag.id === id)?.name)
						.filter(Boolean) as string[]
					const removeNames = remove
						.map((id) => tags.find((tag) => tag.id === id)?.name)
						.filter(Boolean) as string[]
					runOrConfirm({
						title: 'Confirm tags',
						message: bulkTagsMessage(count, addNames, removeNames),
						method: 'modify_tags',
						parameters: { add_tags: add, remove_tags: remove },
					})
				}}
			/>

			<AssignDialog
				kind={assignOpen}
				onOpenChange={(open) => {
					if (!open) setAssignOpen(null)
				}}
				count={count}
				options={
					assignOpen === 'correspondent'
						? correspondents
						: assignOpen === 'document type'
							? documentTypes
							: storagePaths
				}
				onApply={(id, name) => {
					if (!assignOpen) return
					const method =
						assignOpen === 'correspondent'
							? 'set_correspondent'
							: assignOpen === 'document type'
								? 'set_document_type'
								: 'set_storage_path'
					const key =
						assignOpen === 'correspondent'
							? 'correspondent'
							: assignOpen === 'document type'
								? 'document_type'
								: 'storage_path'
					runOrConfirm({
						title: `Confirm ${assignOpen}`,
						message: bulkAssignMessage(assignOpen, count, name),
						method,
						parameters: { [key]: id },
					})
				}}
			/>

			<AlertDialog
				open={Boolean(pendingEdit)}
				onOpenChange={(open) => {
					if (!open) setPendingEdit(null)
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{pendingEdit?.title}</AlertDialogTitle>
						<AlertDialogDescription>
							{pendingEdit?.message}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (!pendingEdit) return
								onEdit({
									method: pendingEdit.method,
									parameters: pendingEdit.parameters,
								})
								setPendingEdit(null)
							}}
						>
							Confirm
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}

function TagsDialog({
	open,
	onOpenChange,
	tags,
	count,
	onApply,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	tags: TagType[]
	count: number
	onApply: (add: number[], remove: number[]) => void
}) {
	const [add, setAdd] = useState<number[]>([])
	const [remove, setRemove] = useState<number[]>([])

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) {
					setAdd([])
					setRemove([])
				}
				onOpenChange(next)
			}}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Edit tags</DialogTitle>
					<DialogDescription>
						Add or remove tags on {count} selected document
						{count === 1 ? '' : 's'}.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div>
						<Label>Add</Label>
						<div className="mt-2">
							<TagPicker
								tags={tags.filter((tag) => !remove.includes(tag.id))}
								selected={add}
								onChange={setAdd}
							/>
						</div>
					</div>
					<div>
						<Label>Remove</Label>
						<div className="mt-2">
							<TagPicker
								tags={tags.filter((tag) => !add.includes(tag.id))}
								selected={remove}
								onChange={setRemove}
							/>
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						disabled={add.length === 0 && remove.length === 0}
						onClick={() => {
							onApply(add, remove)
							setAdd([])
							setRemove([])
							onOpenChange(false)
						}}
					>
						Apply
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

function AssignDialog({
	kind,
	onOpenChange,
	count,
	options,
	onApply,
}: {
	kind: null | 'correspondent' | 'document type' | 'storage path'
	onOpenChange: (open: boolean) => void
	count: number
	options: Array<{ id: number; name: string }>
	onApply: (id: number | null, name?: string | null) => void
}) {
	const [value, setValue] = useState<string>()

	return (
		<Dialog
			open={Boolean(kind)}
			onOpenChange={(next) => {
				if (!next) setValue(undefined)
				onOpenChange(next)
			}}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{kind ? `Set ${kind}` : 'Assign'}</DialogTitle>
					<DialogDescription>
						Applies to {count} selected document{count === 1 ? '' : 's'}. Choose
						None to clear the field.
					</DialogDescription>
				</DialogHeader>
				<Select value={value} onValueChange={setValue}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Choose…" />
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
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						disabled={!value}
						onClick={() => {
							const id = value === 'none' ? null : Number(value)
							const name =
								id == null
									? null
									: options.find((option) => option.id === id)?.name
							onApply(id, name)
							setValue(undefined)
							onOpenChange(false)
						}}
					>
						Apply
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
