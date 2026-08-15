'use client'

import { useEffect } from 'react'

export function useHotkeys(
	map: Record<string, (event: KeyboardEvent) => void>
) {
	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			const target = event.target as HTMLElement | null
			const typing =
				target?.tagName === 'INPUT' ||
				target?.tagName === 'TEXTAREA' ||
				target?.isContentEditable
			const key = [
				event.metaKey || event.ctrlKey ? 'mod' : '',
				event.shiftKey ? 'shift' : '',
				event.key.toLowerCase(),
			]
				.filter(Boolean)
				.join('+')

			const handler = map[key]
			if (!handler) return
			if (typing && !key.startsWith('mod')) return
			event.preventDefault()
			handler(event)
		}

		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [map])
}
