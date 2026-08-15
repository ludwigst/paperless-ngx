'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isMfaRequired } from '@/lib/api/errors'

const schema = z.object({
	username: z.string().min(1, 'Username is required'),
	password: z.string().min(1, 'Password is required'),
	code: z.string().optional(),
})

export function LoginForm() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [error, setError] = useState<string | null>(null)
	const [mfa, setMfa] = useState(false)
	const [pending, setPending] = useState(false)

	async function onSubmit(formData: FormData) {
		setError(null)
		const parsed = schema.safeParse({
			username: formData.get('username'),
			password: formData.get('password'),
			code: formData.get('code') || undefined,
		})
		if (!parsed.success) {
			setError(
				parsed.error.issues[0]?.message ?? 'Check the form and try again.'
			)
			return
		}

		setPending(true)
		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(parsed.data),
			})
			const body = await response.json().catch(() => null)
			if (!response.ok) {
				if (isMfaRequired(body) || body?.mfa_required) {
					setMfa(true)
					setError(
						'Enter the authentication code from your authenticator app.'
					)
					return
				}
				setError(body?.detail ?? 'Could not sign in.')
				return
			}
			router.replace(searchParams.get('next') || '/documents')
			router.refresh()
		} catch {
			setError('Network error. Confirm the Paperless backend is reachable.')
		} finally {
			setPending(false)
		}
	}

	return (
		<Card className="border-paper-rule shadow-lg shadow-copper/5">
			<CardHeader>
				<CardTitle className="font-heading text-3xl italic">Sign in</CardTitle>
				<CardDescription>
					Use your Paperless account. Credentials stay on the server.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form action={onSubmit} className="space-y-4">
					{error ? (
						<Alert variant="destructive">
							<AlertTitle>Could not sign in</AlertTitle>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					) : null}
					<div className="space-y-2">
						<Label htmlFor="username">Username</Label>
						<Input
							id="username"
							name="username"
							autoComplete="username"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							name="password"
							type="password"
							autoComplete="current-password"
							required
						/>
					</div>
					{mfa ? (
						<div className="space-y-2">
							<Label htmlFor="code">Authentication code</Label>
							<Input
								id="code"
								name="code"
								inputMode="numeric"
								autoComplete="one-time-code"
							/>
						</div>
					) : null}
					<Button type="submit" className="w-full" disabled={pending}>
						{pending ? 'Signing in…' : 'Continue'}
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
