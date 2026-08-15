'use client'

import { Plus, X } from 'lucide-react'

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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
	customFieldInputKind,
	displayCustomFieldValue,
	parseCustomFieldValue,
} from '@/lib/utils/custom-fields'
import type { CustomField, CustomFieldInstance } from '@/types/paperless'

export function CustomFieldEditor({
	definitions,
	instances,
	onChange,
}: {
	definitions: CustomField[]
	instances: CustomFieldInstance[]
	onChange: (next: CustomFieldInstance[]) => void
}) {
	const unused = definitions.filter(
		(field) => !instances.some((instance) => instance.field === field.id)
	)

	function updateValue(index: number, raw: string, field: CustomField) {
		const next = instances.map((instance, itemIndex) =>
			itemIndex === index
				? {
						...instance,
						value: parseCustomFieldValue(field.data_type, raw),
					}
				: instance
		)
		onChange(next)
	}

	return (
		<div className="space-y-3">
			{instances.map((instance, index) => {
				const field = definitions.find((item) => item.id === instance.field)
				if (!field) return null
				const kind = customFieldInputKind(field)
				return (
					<div key={`${instance.field}-${index}`} className="space-y-1.5">
						<div className="flex items-center justify-between gap-2">
							<Label>{field.name}</Label>
							<Button
								variant="ghost"
								size="icon-xs"
								aria-label={`Remove ${field.name}`}
								onClick={() =>
									onChange(
										instances.filter((_, itemIndex) => itemIndex !== index)
									)
								}
							>
								<X className="size-3.5" />
							</Button>
						</div>
						{kind === 'boolean' ? (
							<Switch
								checked={Boolean(instance.value)}
								onCheckedChange={(checked) =>
									updateValue(index, checked ? 'true' : 'false', field)
								}
							/>
						) : null}
						{kind === 'select' ? (
							<Select
								value={
									instance.value == null || instance.value === ''
										? undefined
										: String(instance.value)
								}
								onValueChange={(value) => updateValue(index, value, field)}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Choose…" />
								</SelectTrigger>
								<SelectContent>
									{field.extra_data?.select_options?.map((option) => (
										<SelectItem key={option.id} value={option.id}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						) : null}
						{kind === 'textarea' ? (
							<Textarea
								value={displayCustomFieldValue(instance.value)}
								onChange={(event) =>
									updateValue(index, event.target.value, field)
								}
							/>
						) : null}
						{kind === 'date' || kind === 'number' || kind === 'text' ? (
							<Input
								type={kind === 'text' ? 'text' : kind}
								value={displayCustomFieldValue(instance.value)}
								onChange={(event) =>
									updateValue(index, event.target.value, field)
								}
							/>
						) : null}
					</div>
				)
			})}
			{unused.length ? (
				<Select
					key={instances.length}
					onValueChange={(value) => {
						const field = Number(value)
						onChange([
							...instances,
							{
								id: -Date.now(),
								document: instances[0]?.document ?? 0,
								field,
								value: null,
							},
						])
					}}
				>
					<SelectTrigger className="w-full">
						<span className="flex items-center gap-1 text-muted-foreground">
							<Plus className="size-3.5" />
							Add custom field
						</span>
					</SelectTrigger>
					<SelectContent>
						{unused.map((field) => (
							<SelectItem key={field.id} value={String(field.id)}>
								{field.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			) : null}
		</div>
	)
}
