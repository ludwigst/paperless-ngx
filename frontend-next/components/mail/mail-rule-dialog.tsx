'use client'

import { toast } from 'sonner'

import { TagPicker } from '@/components/documents/tag-picker'
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
import {
	ATTACHMENT_TYPE,
	CONSUMPTION_SCOPE,
	CORRESPONDENT_FROM,
	CORRESPONDENT_FROM_CUSTOM,
	MAIL_ACTION,
	MAIL_ACTION_MOVE,
	PDF_LAYOUT,
	ruleNeedsActionParameter,
	rulePayload,
	TITLE_FROM,
	validateMailRule,
} from '@/lib/utils/mail'
import type {
	Correspondent,
	DocumentType,
	MailAccount,
	MailRule,
	Tag,
} from '@/types/paperless'

export type MailRuleDraft = Partial<MailRule> & { id?: number }

export function MailRuleDialog({
	rule,
	onChange,
	accounts,
	tags,
	correspondents,
	documentTypes,
	open,
	onOpenChange,
	onSave,
	saving,
}: {
	rule: MailRuleDraft
	onChange: (next: MailRuleDraft) => void
	accounts: MailAccount[]
	tags: Tag[]
	correspondents: Correspondent[]
	documentTypes: DocumentType[]
	open: boolean
	onOpenChange: (open: boolean) => void
	onSave: (payload: Record<string, unknown>) => void
	saving: boolean
}) {
	function patch(next: Partial<MailRuleDraft>) {
		onChange({ ...rule, ...next })
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{rule.id ? 'Edit mail rule' : 'Create mail rule'}
					</DialogTitle>
				</DialogHeader>
				<form
					className="space-y-4"
					onSubmit={(event) => {
						event.preventDefault()
						const error = validateMailRule(rule)
						if (error) {
							toast.error(error)
							return
						}
						onSave(rulePayload(rule))
					}}
				>
					<section className="space-y-3">
						<Field
							id="rule-name"
							label="Name"
							value={rule.name ?? ''}
							onChange={(name) => patch({ name })}
						/>
						<FormSelect
							label="Account"
							value={rule.account || undefined}
							options={accounts.map((account) => ({
								id: account.id,
								label: account.name,
							}))}
							onChange={(account) => patch({ account: account ?? 0 })}
							placeholder="Choose an account"
						/>
						<div className="grid grid-cols-2 gap-3">
							<Field
								id="rule-order"
								label="Order"
								value={String(rule.order ?? 0)}
								onChange={(value) => patch({ order: Number(value) || 0 })}
								inputMode="numeric"
							/>
							<Field
								id="rule-age"
								label="Maximum age (days)"
								value={String(rule.maximum_age ?? 30)}
								onChange={(value) =>
									patch({ maximum_age: Number(value) || 0 })
								}
								inputMode="numeric"
							/>
						</div>
						<Field
							id="rule-folder"
							label="Folder"
							value={rule.folder ?? 'INBOX'}
							onChange={(folder) => patch({ folder })}
						/>
						<div className="flex items-center justify-between gap-2">
							<Label htmlFor="rule-enabled">Enabled</Label>
							<Switch
								id="rule-enabled"
								checked={rule.enabled !== false}
								onCheckedChange={(enabled) => patch({ enabled })}
							/>
						</div>
						<div className="flex items-center justify-between gap-2">
							<Label htmlFor="rule-stop">
								Stop processing after this rule
							</Label>
							<Switch
								id="rule-stop"
								checked={Boolean(rule.stop_processing)}
								onCheckedChange={(stop_processing) =>
									patch({ stop_processing })
								}
							/>
						</div>
					</section>

					<section className="space-y-3">
						<p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
							Filters
						</p>
						<Field
							id="rule-from"
							label="From"
							value={rule.filter_from ?? ''}
							onChange={(filter_from) => patch({ filter_from })}
						/>
						<Field
							id="rule-to"
							label="To"
							value={rule.filter_to ?? ''}
							onChange={(filter_to) => patch({ filter_to })}
						/>
						<Field
							id="rule-subject"
							label="Subject"
							value={rule.filter_subject ?? ''}
							onChange={(filter_subject) => patch({ filter_subject })}
						/>
						<Field
							id="rule-body"
							label="Body"
							value={rule.filter_body ?? ''}
							onChange={(filter_body) => patch({ filter_body })}
						/>
						<Field
							id="rule-include"
							label="Include attachment filename"
							value={rule.filter_attachment_filename_include ?? ''}
							onChange={(filter_attachment_filename_include) =>
								patch({ filter_attachment_filename_include })
							}
						/>
						<Field
							id="rule-exclude"
							label="Exclude attachment filename"
							value={rule.filter_attachment_filename_exclude ?? ''}
							onChange={(filter_attachment_filename_exclude) =>
								patch({ filter_attachment_filename_exclude })
							}
						/>
					</section>

					<section className="space-y-3">
						<p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
							Consumption
						</p>
						<FormSelect
							label="Consumption scope"
							value={rule.consumption_scope}
							options={CONSUMPTION_SCOPE}
							onChange={(consumption_scope) =>
								patch({ consumption_scope: consumption_scope ?? 1 })
							}
						/>
						<FormSelect
							label="Attachment type"
							value={rule.attachment_type}
							options={ATTACHMENT_TYPE}
							onChange={(attachment_type) =>
								patch({ attachment_type: attachment_type ?? 1 })
							}
						/>
						<FormSelect
							label="PDF layout"
							value={rule.pdf_layout}
							options={PDF_LAYOUT}
							onChange={(pdf_layout) => patch({ pdf_layout: pdf_layout ?? 0 })}
						/>
						<FormSelect
							label="Action"
							value={rule.action}
							options={MAIL_ACTION}
							onChange={(action) => patch({ action: action ?? 3 })}
						/>
						{ruleNeedsActionParameter(rule.action) ? (
							<Field
								id="rule-action-param"
								label={
									rule.action === MAIL_ACTION_MOVE
										? 'Destination folder'
										: 'IMAP tag'
								}
								value={rule.action_parameter ?? ''}
								onChange={(action_parameter) => patch({ action_parameter })}
							/>
						) : null}
					</section>

					<section className="space-y-3">
						<p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
							Assignment
						</p>
						<FormSelect
							label="Title"
							value={rule.assign_title_from}
							options={TITLE_FROM}
							onChange={(assign_title_from) =>
								patch({ assign_title_from: assign_title_from ?? 1 })
							}
						/>
						<div className="space-y-1.5">
							<Label>Tags</Label>
							<TagPicker
								tags={tags}
								selected={rule.assign_tags ?? []}
								onChange={(assign_tags) => patch({ assign_tags })}
							/>
						</div>
						<FormSelect
							label="Document type"
							value={rule.assign_document_type}
							options={documentTypes.map((item) => ({
								id: item.id,
								label: item.name,
							}))}
							onChange={(assign_document_type) =>
								patch({ assign_document_type })
							}
							allowNone
						/>
						<FormSelect
							label="Correspondent from"
							value={rule.assign_correspondent_from}
							options={CORRESPONDENT_FROM}
							onChange={(assign_correspondent_from) =>
								patch({
									assign_correspondent_from: assign_correspondent_from ?? 1,
								})
							}
						/>
						{rule.assign_correspondent_from === CORRESPONDENT_FROM_CUSTOM ? (
							<FormSelect
								label="Correspondent"
								value={rule.assign_correspondent}
								options={correspondents.map((item) => ({
									id: item.id,
									label: item.name,
								}))}
								onChange={(assign_correspondent) =>
									patch({ assign_correspondent })
								}
								allowNone
							/>
						) : null}
						<div className="flex items-center justify-between gap-2">
							<Label htmlFor="rule-owner">Assign owner from this rule</Label>
							<Switch
								id="rule-owner"
								checked={rule.assign_owner_from_rule !== false}
								onCheckedChange={(assign_owner_from_rule) =>
									patch({ assign_owner_from_rule })
								}
							/>
						</div>
					</section>
					<DialogFooter>
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
