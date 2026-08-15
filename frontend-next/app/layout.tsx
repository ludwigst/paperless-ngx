import type { Metadata } from 'next'
import { IBM_Plex_Mono, Newsreader, Public_Sans } from 'next/font/google'
import type { ReactNode } from 'react'

import { Providers } from '@/components/providers'

import './globals.css'

const publicSans = Public_Sans({
	subsets: ['latin'],
	variable: '--font-public-sans',
})

const newsreader = Newsreader({
	subsets: ['latin'],
	variable: '--font-newsreader',
	style: ['normal', 'italic'],
})

const plexMono = IBM_Plex_Mono({
	subsets: ['latin'],
	weight: ['400', '500'],
	variable: '--font-ibm-plex-mono',
})

export const metadata: Metadata = {
	title: {
		default: 'Paperless',
		template: '%s · Paperless',
	},
	description: 'A private document archive with search, tags, and workflows.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			className={`${publicSans.variable} ${newsreader.variable} ${plexMono.variable} h-full`}
			suppressHydrationWarning
		>
			<body className="min-h-full flex flex-col">
				<Providers>{children}</Providers>
			</body>
		</html>
	)
}
