'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Copy, Mail, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
	MailAccountDialog,
	type MailAccountDraft,
} from '@/components/mail/mail-account-dialog'
import {
	MailRuleDialog,
	type MailRuleDraft,
} from '@/components/mail/mail-rule-dialog'
import { ProcessedMailDialog } from '@/components/mail/processed-mail-dialog'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { usePermission, useUiSettings } from '@/hooks/use-auth'
import {
	useCorrespondents,
	useDocumentTypes,
	useTags,
} from '@/hooks/use-metadata'
import {
	createMailAccount,
	createMailRule,
	deleteMailAccount,
	deleteMailRule,
	listMailAccounts,
	listMailRules,
	processMailAccount,
	updateMailAccount,
	updateMailRule,
} from '@/lib/api/mail'
import { ownsObject } from '@/lib/auth/permissions'
import { queryKeys } from '@/lib/query'
import {
	accountTypeLabel,
	copyMailRule,
	emptyMailAccount,
	emptyMailRule,
} from '@/lib/utils/mail'
import type { MailAccount, MailRule } from '@/types/paperless'

export function MailPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const queryClient = useQueryClient()
	const ui = useUiSettings()
	const user = ui.data?.user
	const canViewAccounts = usePermission('view', 'mailaccount')
	const canAddAccount = usePermission('add', 'mailaccount')
	const canChangeAccount = usePermission('change', 'mailaccount')
	const canDeleteAccount = usePermission('delete', 'mailaccount')
	const canViewRules = usePermission('view', 'mailrule')
	const canAddRule = usePermission('add', 'mailrule')
	const canChangeRule = usePermission('change', 'mailrule')
	const canDeleteRule = usePermission('delete', 'mailrule')
	const canViewProcessed = usePermission('view', 'processedmail')
	const tags = useTags()
	const correspondents = useCorrespondents()
	const types = useDocumentTypes()

	const accounts = useQuery({
		queryKey: queryKeys.mailAccounts,
		queryFn: listMailAccounts,
		enabled: canViewAccounts,
	})
	const rules = useQuery({
		queryKey: queryKeys.mailRules,
		queryFn: listMailRules,
		enabled: canViewRules,
	})

	const [accountDraft, setAccountDraft] = useState<MailAccountDraft | null>(
		null
	)
	const [ruleDraft, setRuleDraft] = useState<MailRuleDraft | null>(null)
	const [processedRule, setProcessedRule] = useState<MailRule | null>(null)
	const [pendingDelete, setPendingDelete] = useState<
		| { kind: 'account'; item: MailAccount }
		| { kind: 'rule'; item: MailRule }
		| null
	>(null)

	useEffect(() => {
		const result = searchParams.get('oauth_success')
		if (result == null) return
		if (result === '1') toast.success('Mail account connected')
		else toast.error('Could not connect the mail account')
		router.replace('/mail')
	}, [router, searchParams])

	const saveAccount = useMutation({
		mutationFn: (payload: Record<string, unknown>) =>
			accountDraft?.id
				? updateMailAccount(accountDraft.id, payload)
				: createMailAccount(payload),
		onSuccess: async () => {
			toast.success('Mail account saved')
			setAccountDraft(null)
			await queryClient.invalidateQueries({ queryKey: queryKeys.mailAccounts })
		},
		onError: (error) => toast.error(error.message),
	})

	const saveRule = useMutation({
		mutationFn: (payload: Record<string, unknown>) =>
			ruleDraft?.id
				? updateMailRule(ruleDraft.id, payload)
				: createMailRule(payload),
		onSuccess: async () => {
			toast.success('Mail rule saved')
			setRuleDraft(null)
			await queryClient.invalidateQueries({ queryKey: queryKeys.mailRules })
		},
		onError: (error) => toast.error(error.message),
	})

	const process = useMutation({
		mutationFn: (id: number) => processMailAccount(id),
		onSuccess: () => toast.success('Mail processing started'),
		onError: (error) => toast.error(error.message),
	})

	const toggleRule = useMutation({
		mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
			updateMailRule(id, { enabled }),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.mailRules })
		},
		onError: (error) => toast.error(error.message),
	})

	const remove = useMutation({
		mutationFn: async () => {
			if (!pendingDelete) return
			if (pendingDelete.kind === 'account') {
				await deleteMailAccount(pendingDelete.item.id)
			} else {
				await deleteMailRule(pendingDelete.item.id)
			}
		},
		onSuccess: async () => {
			toast.success('Deleted')
			setPendingDelete(null)
			await queryClient.invalidateQueries({ queryKey: queryKeys.mailAccounts })
			await queryClient.invalidateQueries({ queryKey: queryKeys.mailRules })
		},
		onError: (error) => toast.error(error.message),
	})

	const gmailUrl = ui.data?.settings.gmail_oauth_url as string | undefined
	const outlookUrl = ui.data?.settings.outlook_oauth_url as string | undefined
	const accountRows = accounts.data?.results ?? []
	const ruleRows = rules.data?.results ?? []

	if (ui.isLoading) {
		return <Skeleton className="h-64 w-full" />
	}

	if (!canViewAccounts && !canViewRules) {
		return (
			<p className="text-muted-foreground">
				You do not have permission to view mail settings.
			</p>
		)
	}

	return (
		<div className="space-y-8">
			<div>
				<p className="text-[11px] uppercase tracking-[0.22em] text-copper">
					Manage
				</p>
				<h1 className="font-heading text-4xl italic">Mail</h1>
				<p className="mt-1 max-w-2xl text-sm text-muted-foreground">
					IMAP accounts and rules that consume incoming mail into Paperless.
				</p>
			</div>

			{canViewAccounts ? (
				<section className="space-y-3">
					<div className="flex flex-wrap items-center gap-2">
						<h2 className="font-heading text-2xl italic">Accounts</h2>
						{canAddAccount ? (
							<Button
								size="sm"
								className="ml-auto"
								onClick={() => setAccountDraft(emptyMailAccount())}
							>
								<Plus className="size-3.5" />
								Add account
							</Button>
						) : null}
						{canAddAccount && gmailUrl ? (
							<Button variant="outline" size="sm" asChild>
								<a href={gmailUrl}>Connect Gmail</a>
							</Button>
						) : null}
						{canAddAccount && outlookUrl ? (
							<Button variant="outline" size="sm" asChild>
								<a href={outlookUrl}>Connect Outlook</a>
							</Button>
						) : null}
					</div>
					{accounts.isLoading ? <Skeleton className="h-32 w-full" /> : null}
					<div className="overflow-hidden rounded-xl border bg-card">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Server</TableHead>
									<TableHead className="hidden md:table-cell">
										Username
									</TableHead>
									<TableHead className="w-40" />
								</TableRow>
							</TableHeader>
							<TableBody>
								{accountRows.map((account) => {
									const owner = ownsObject(user, account.owner)
									const canEdit =
										canChangeAccount && account.user_can_change !== false
									return (
										<TableRow key={account.id}>
											<TableCell className="font-medium">
												{account.name}
												<span className="ml-2 text-xs text-muted-foreground">
													{accountTypeLabel(account.account_type)}
												</span>
											</TableCell>
											<TableCell>{account.imap_server}</TableCell>
											<TableCell className="hidden md:table-cell">
												{account.username}
											</TableCell>
											<TableCell>
												<div className="flex justify-end gap-1">
													{canEdit ? (
														<Button
															variant="ghost"
															size="icon-xs"
															aria-label={`Edit ${account.name}`}
															onClick={() => setAccountDraft(account)}
														>
															<Pencil className="size-3.5" />
														</Button>
													) : null}
													{canChangeAccount && owner ? (
														<Button
															variant="ghost"
															size="icon-xs"
															aria-label={`Process ${account.name}`}
															disabled={process.isPending}
															onClick={() => process.mutate(account.id)}
														>
															<RefreshCw className="size-3.5" />
														</Button>
													) : null}
													{canDeleteAccount && owner ? (
														<Button
															variant="ghost"
															size="icon-xs"
															aria-label={`Delete ${account.name}`}
															onClick={() =>
																setPendingDelete({
																	kind: 'account',
																	item: account,
																})
															}
														>
															<Trash2 className="size-3.5" />
														</Button>
													) : null}
												</div>
											</TableCell>
										</TableRow>
									)
								})}
								{!accounts.isLoading && accountRows.length === 0 ? (
									<TableRow>
										<TableCell colSpan={4} className="text-muted-foreground">
											No mail accounts defined.
										</TableCell>
									</TableRow>
								) : null}
							</TableBody>
						</Table>
					</div>
				</section>
			) : null}

			{canViewRules ? (
				<section className="space-y-3">
					<div className="flex flex-wrap items-center gap-2">
						<h2 className="font-heading text-2xl italic">Rules</h2>
						{canAddRule ? (
							<Button
								size="sm"
								className="ml-auto"
								onClick={() => setRuleDraft(emptyMailRule(accountRows[0]?.id))}
							>
								<Plus className="size-3.5" />
								Add rule
							</Button>
						) : null}
					</div>
					{rules.isLoading ? <Skeleton className="h-32 w-full" /> : null}
					<div className="overflow-hidden rounded-xl border bg-card">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead className="hidden sm:table-cell">Order</TableHead>
									<TableHead>Account</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="w-44" />
								</TableRow>
							</TableHeader>
							<TableBody>
								{ruleRows.map((rule) => {
									const owner = ownsObject(user, rule.owner)
									const canEdit =
										canChangeRule && rule.user_can_change !== false
									const accountName = accountRows.find(
										(account) => account.id === rule.account
									)?.name
									return (
										<TableRow key={rule.id}>
											<TableCell className="font-medium">
												{rule.name}
											</TableCell>
											<TableCell className="hidden sm:table-cell">
												{rule.order ?? 0}
											</TableCell>
											<TableCell>{accountName ?? rule.account}</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<Switch
														checked={rule.enabled !== false}
														disabled={!canChangeRule}
														onCheckedChange={(enabled) =>
															toggleRule.mutate({ id: rule.id, enabled })
														}
														aria-label={`Enable ${rule.name}`}
													/>
													<span className="text-xs text-muted-foreground">
														{rule.enabled !== false ? 'Enabled' : 'Disabled'}
													</span>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex justify-end gap-1">
													{canViewProcessed ? (
														<Button
															variant="ghost"
															size="icon-xs"
															aria-label={`Processed mail for ${rule.name}`}
															onClick={() => setProcessedRule(rule)}
														>
															<Mail className="size-3.5" />
														</Button>
													) : null}
													{canEdit ? (
														<Button
															variant="ghost"
															size="icon-xs"
															aria-label={`Edit ${rule.name}`}
															onClick={() => setRuleDraft(rule)}
														>
															<Pencil className="size-3.5" />
														</Button>
													) : null}
													{canAddRule ? (
														<Button
															variant="ghost"
															size="icon-xs"
															aria-label={`Copy ${rule.name}`}
															onClick={() => setRuleDraft(copyMailRule(rule))}
														>
															<Copy className="size-3.5" />
														</Button>
													) : null}
													{canDeleteRule && owner ? (
														<Button
															variant="ghost"
															size="icon-xs"
															aria-label={`Delete ${rule.name}`}
															onClick={() =>
																setPendingDelete({ kind: 'rule', item: rule })
															}
														>
															<Trash2 className="size-3.5" />
														</Button>
													) : null}
												</div>
											</TableCell>
										</TableRow>
									)
								})}
								{!rules.isLoading && ruleRows.length === 0 ? (
									<TableRow>
										<TableCell colSpan={5} className="text-muted-foreground">
											No mail rules defined.
										</TableCell>
									</TableRow>
								) : null}
							</TableBody>
						</Table>
					</div>
				</section>
			) : null}

			{accountDraft ? (
				<MailAccountDialog
					account={accountDraft}
					onChange={setAccountDraft}
					open
					onOpenChange={(open) => !open && setAccountDraft(null)}
					onSave={(payload) => saveAccount.mutate(payload)}
					saving={saveAccount.isPending}
				/>
			) : null}
			{ruleDraft ? (
				<MailRuleDialog
					rule={ruleDraft}
					onChange={setRuleDraft}
					accounts={accountRows}
					tags={tags.data?.results ?? []}
					correspondents={correspondents.data?.results ?? []}
					documentTypes={types.data?.results ?? []}
					open
					onOpenChange={(open) => !open && setRuleDraft(null)}
					onSave={(payload) => saveRule.mutate(payload)}
					saving={saveRule.isPending}
				/>
			) : null}
			<ProcessedMailDialog
				rule={processedRule}
				open={Boolean(processedRule)}
				onOpenChange={(open) => !open && setProcessedRule(null)}
			/>

			<AlertDialog
				open={Boolean(pendingDelete)}
				onOpenChange={(open) => !open && setPendingDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Delete {pendingDelete?.item.name}?
						</AlertDialogTitle>
						<AlertDialogDescription>
							{pendingDelete?.kind === 'account'
								? 'Rules that use this account will stop working.'
								: 'This rule will no longer consume mail.'}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={() => remove.mutate()}>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
