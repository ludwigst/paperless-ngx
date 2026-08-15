'use client'

import {
	useCorrespondents,
	useDocumentTypes,
	useTags,
} from '@/hooks/use-metadata'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { DOCUMENT_SORT_FIELDS } from '@/types/paperless'

export function DocumentFilters({
	params,
	onChange,
}: {
	params: URLSearchParams
	onChange: (key: string, value?: string) => void
}) {
	const tags = useTags()
	const correspondents = useCorrespondents()
	const types = useDocumentTypes()

	return (
		<div className="grid gap-3 rounded-xl border bg-card p-3 md:grid-cols-2 lg:grid-cols-4">
			<div className="space-y-1.5">
				<Label htmlFor="filter-q">Query</Label>
				<Input
					id="filter-q"
					defaultValue={params.get('q') ?? ''}
					placeholder="Invoice, tax, lease…"
					onBlur={(event) => onChange('q', event.target.value || undefined)}
					onKeyDown={(event) => {
						if (event.key === 'Enter') {
							onChange(
								'q',
								(event.target as HTMLInputElement).value || undefined
							)
						}
					}}
				/>
			</div>
			<FilterSelect
				label="Tag"
				value={params.get('tags') ?? ''}
				onChange={(value) => onChange('tags', value || undefined)}
				options={
					tags.data?.results.map((item) => ({
						id: String(item.id),
						name: item.name,
					})) ?? []
				}
			/>
			<FilterSelect
				label="Correspondent"
				value={params.get('correspondent') ?? ''}
				onChange={(value) => onChange('correspondent', value || undefined)}
				options={
					correspondents.data?.results.map((item) => ({
						id: String(item.id),
						name: item.name,
					})) ?? []
				}
			/>
			<FilterSelect
				label="Document type"
				value={params.get('document_type') ?? ''}
				onChange={(value) => onChange('document_type', value || undefined)}
				options={
					types.data?.results.map((item) => ({
						id: String(item.id),
						name: item.name,
					})) ?? []
				}
			/>
			<div className="space-y-1.5">
				<Label>Created after</Label>
				<Input
					type="date"
					defaultValue={params.get('created_after') ?? ''}
					onChange={(event) =>
						onChange('created_after', event.target.value || undefined)
					}
				/>
			</div>
			<div className="space-y-1.5">
				<Label>Created before</Label>
				<Input
					type="date"
					defaultValue={params.get('created_before') ?? ''}
					onChange={(event) =>
						onChange('created_before', event.target.value || undefined)
					}
				/>
			</div>
			<FilterSelect
				label="Sort"
				value={(params.get('ordering') ?? '-created').replace(/^-/, '')}
				onChange={(value) => onChange('ordering', value || undefined)}
				options={DOCUMENT_SORT_FIELDS.filter(
					(field) => field.field !== 'score'
				).map((field) => ({
					id: field.field,
					name: field.name,
				}))}
			/>
		</div>
	)
}

function FilterSelect({
	label,
	value,
	onChange,
	options,
}: {
	label: string
	value: string
	onChange: (value: string) => void
	options: Array<{ id: string; name: string }>
}) {
	return (
		<div className="space-y-1.5">
			<Label>{label}</Label>
			<Select
				value={value || 'all'}
				onValueChange={(next) => onChange(next === 'all' ? '' : next)}
			>
				<SelectTrigger>
					<SelectValue placeholder={`Any ${label.toLowerCase()}`} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">Any</SelectItem>
					{options.map((option) => (
						<SelectItem key={option.id} value={option.id}>
							{option.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}
