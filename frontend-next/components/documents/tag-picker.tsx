'use client'

import { Plus, X } from 'lucide-react'

import { TagChip } from '@/components/documents/tag-chip'
import { Button } from '@/components/ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import type { Tag } from '@/types/paperless'

export function TagPicker({
	tags,
	selected,
	onChange,
}: {
	tags: Tag[]
	selected: number[]
	onChange: (ids: number[]) => void
}) {
	const available = tags.filter((tag) => !selected.includes(tag.id))

	return (
		<div className="space-y-2">
			<div className="flex flex-wrap gap-1">
				{selected.map((tagId) => {
					const tag = tags.find((item) => item.id === tagId)
					if (!tag) return null
					return (
						<button
							key={tag.id}
							type="button"
							className="group relative"
							onClick={() => onChange(selected.filter((id) => id !== tag.id))}
							aria-label={`Remove ${tag.name}`}
						>
							<TagChip tag={tag} />
							<X className="pointer-events-none absolute -right-1 -top-1 hidden size-3 rounded-full bg-background text-foreground group-hover:block" />
						</button>
					)
				})}
			</div>
			<Popover>
				<PopoverTrigger asChild>
					<Button variant="outline" size="sm" disabled={!available.length}>
						<Plus className="size-3.5" />
						Add tag
					</Button>
				</PopoverTrigger>
				<PopoverContent align="start" className="w-64 p-0">
					<Command>
						<CommandInput placeholder="Search tags…" />
						<CommandList>
							<CommandEmpty>No matching tags.</CommandEmpty>
							<CommandGroup>
								{available.map((tag) => (
									<CommandItem
										key={tag.id}
										value={tag.name}
										onSelect={() => onChange([...selected, tag.id])}
									>
										<TagChip tag={tag} />
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	)
}
