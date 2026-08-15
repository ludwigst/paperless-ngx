'use client'

import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

export function FormSelect({
	label,
	value,
	options,
	onChange,
	placeholder,
	allowNone,
}: {
	label: string
	value?: number | null
	options: ReadonlyArray<{ id: number; label: string }>
	onChange: (value: number | null) => void
	placeholder?: string
	allowNone?: boolean
}) {
	return (
		<div className="space-y-1.5">
			<Label>{label}</Label>
			<Select
				value={
					value == null ? (allowNone ? 'none' : undefined) : String(value)
				}
				onValueChange={(next) =>
					onChange(next === 'none' ? null : Number(next))
				}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{allowNone ? <SelectItem value="none">None</SelectItem> : null}
					{options.map((option) => (
						<SelectItem key={option.id} value={String(option.id)}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}
