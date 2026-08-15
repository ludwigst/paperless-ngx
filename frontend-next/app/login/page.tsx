import { Suspense } from 'react'

import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
	return (
		<main className="grid min-h-svh place-items-center px-4 py-10">
			<div className="w-full max-w-md space-y-8">
				<div className="text-center">
					<p className="font-heading text-5xl italic tracking-tight">
						Paperless
					</p>
					<p className="mt-2 text-[11px] uppercase tracking-[0.28em] text-copper">
						Private archive
					</p>
				</div>
				<Suspense>
					<LoginForm />
				</Suspense>
			</div>
		</main>
	)
}
