'use client'

import { cn } from '@/lib/utils'

export function SuggestionChips({
	items,
	onPick,
}: {
	items: Array<{ key: string; label: string; create?: boolean }>
	onPick: (key: string) => void
}) {
	if (!items.length) return null
	return (
		<p className="mt-1.5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
			<span>Suggestions:</span>
			{items.map((item) => (
				<button
					key={item.key}
					type="button"
					className={cn(
						'rounded-full border px-2 py-0.5 text-foreground transition-colors hover:bg-muted',
						item.create && 'border-dashed text-copper'
					)}
					onClick={() => onPick(item.key)}
				>
					{item.create ? `Create “${item.label}”` : item.label}
				</button>
			))}
		</p>
	)
}
