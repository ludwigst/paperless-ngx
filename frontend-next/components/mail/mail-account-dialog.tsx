'use client'

import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

import { FormSelect } from '@/components/mail/form-select'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { testMailAccount } from '@/lib/api/mail'
import {
	accountPayload,
	IMAP_SECURITY,
	validateMailAccount,
} from '@/lib/utils/mail'
import type { MailAccount } from '@/types/paperless'

export type MailAccountDraft = Partial<MailAccount> & { id?: number }

export function MailAccountDialog({
	account,
	onChange,
	open,
	onOpenChange,
	onSave,
	saving,
}: {
	account: MailAccountDraft
	onChange: (next: MailAccountDraft) => void
	open: boolean
	onOpenChange: (open: boolean) => void
	onSave: (payload: Record<string, unknown>) => void
	saving: boolean
}) {
	const [testMessage, setTestMessage] = useState<string | null>(null)
	const test = useMutation({
		mutationFn: () => testMailAccount(accountPayload(account)),
		onSuccess: () => {
			setTestMessage('Connected successfully')
			toast.success('IMAP connection succeeded')
		},
		onError: (error) => {
			setTestMessage(error.message)
			toast.error(error.message)
		},
	})

	function patch(next: Partial<MailAccountDraft>) {
		setTestMessage(null)
		onChange({ ...account, ...next })
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) setTestMessage(null)
				onOpenChange(next)
			}}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{account.id ? 'Edit mail account' : 'Create mail account'}
					</DialogTitle>
				</DialogHeader>
				<form
					className="space-y-3"
					onSubmit={(event) => {
						event.preventDefault()
						const error = validateMailAccount(account)
						if (error) {
							toast.error(error)
							return
						}
						onSave(accountPayload(account))
					}}
				>
					<Field
						id="mail-name"
						label="Name"
						value={account.name ?? ''}
						onChange={(name) => patch({ name })}
					/>
					<Field
						id="mail-server"
						label="IMAP server"
						value={account.imap_server ?? ''}
						onChange={(imap_server) => patch({ imap_server })}
					/>
					<Field
						id="mail-port"
						label="Port"
						value={account.imap_port != null ? String(account.imap_port) : ''}
						onChange={(value) =>
							patch({ imap_port: value === '' ? null : Number(value) })
						}
						inputMode="numeric"
					/>
					<FormSelect
						label="Encryption"
						value={account.imap_security}
						options={IMAP_SECURITY}
						onChange={(imap_security) =>
							patch({ imap_security: imap_security ?? 2 })
						}
					/>
					<Field
						id="mail-username"
						label="Username"
						value={account.username ?? ''}
						onChange={(username) => patch({ username })}
					/>
					<div className="space-y-1.5">
						<Label htmlFor="mail-password">Password</Label>
						<Input
							id="mail-password"
							type="password"
							autoComplete="new-password"
							value={account.password ?? ''}
							onChange={(event) => patch({ password: event.target.value })}
						/>
					</div>
					<div className="flex items-center justify-between gap-2">
						<Label htmlFor="mail-token">Password is an access token</Label>
						<Switch
							id="mail-token"
							checked={Boolean(account.is_token)}
							onCheckedChange={(is_token) => patch({ is_token })}
						/>
					</div>
					<Field
						id="mail-charset"
						label="Character set"
						value={account.character_set ?? 'UTF-8'}
						onChange={(character_set) => patch({ character_set })}
					/>
					{testMessage ? (
						<p className="text-sm text-muted-foreground">{testMessage}</p>
					) : null}
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							disabled={test.isPending}
							onClick={() => test.mutate()}
						>
							Test
						</Button>
						<Button type="submit" disabled={saving}>
							Save
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}

function Field({
	id,
	label,
	value,
	onChange,
	inputMode,
}: {
	id: string
	label: string
	value: string
	onChange: (value: string) => void
	inputMode?: 'numeric'
}) {
	return (
		<div className="space-y-1.5">
			<Label htmlFor={id}>{label}</Label>
			<Input
				id={id}
				value={value}
				inputMode={inputMode}
				onChange={(event) => onChange(event.target.value)}
			/>
		</div>
	)
}
