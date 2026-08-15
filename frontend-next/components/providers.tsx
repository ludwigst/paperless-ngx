'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { useState } from 'react'

import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { makeQueryClient } from '@/lib/query'

export function Providers({ children }: { children: React.ReactNode }) {
	const [client] = useState(() => makeQueryClient())

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<QueryClientProvider client={client}>
				<TooltipProvider delayDuration={200}>
					{children}
					<Toaster richColors closeButton />
				</TooltipProvider>
			</QueryClientProvider>
		</ThemeProvider>
	)
}
