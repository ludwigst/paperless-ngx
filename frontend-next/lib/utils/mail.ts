import type { MailAccount, MailRule } from '@/types/paperless'

export const IMAP_SECURITY = [
	{ id: 1, label: 'No encryption' },
	{ id: 2, label: 'SSL' },
	{ id: 3, label: 'STARTTLS' },
] as const

export const MAIL_ACCOUNT_TYPE = [
	{ id: 1, label: 'IMAP' },
	{ id: 2, label: 'Gmail' },
	{ id: 3, label: 'Outlook' },
] as const

export const MAIL_ACTION = [
	{ id: 1, label: 'Delete' },
	{ id: 2, label: 'Move to specified folder' },
	{ id: 3, label: 'Mark as read, don’t process read mails' },
	{ id: 4, label: 'Flag the mail, don’t process flagged mails' },
	{ id: 5, label: 'Tag the mail, don’t process tagged mails' },
] as const

export const CONSUMPTION_SCOPE = [
	{ id: 1, label: 'Only process attachments' },
	{ id: 2, label: 'Process message as .eml' },
	{ id: 3, label: 'Process message as .eml and attachments separately' },
] as const

export const ATTACHMENT_TYPE = [
	{ id: 1, label: 'Only process attachments' },
	{ id: 2, label: 'Process all files, including inline attachments' },
] as const

export const PDF_LAYOUT = [
	{ id: 0, label: 'System default' },
	{ id: 1, label: 'Text, then HTML' },
	{ id: 2, label: 'HTML, then text' },
	{ id: 3, label: 'HTML only' },
	{ id: 4, label: 'Text only' },
] as const

export const TITLE_FROM = [
	{ id: 1, label: 'Use subject as title' },
	{ id: 2, label: 'Use attachment filename as title' },
	{ id: 3, label: 'Do not assign title from this rule' },
] as const

export const CORRESPONDENT_FROM = [
	{ id: 1, label: 'Do not assign a correspondent' },
	{ id: 2, label: 'Use mail address' },
	{ id: 3, label: 'Use name (or mail address if not available)' },
	{ id: 4, label: 'Use correspondent selected below' },
] as const

export const MAIL_ACTION_MOVE = 2
export const MAIL_ACTION_TAG = 5
export const CORRESPONDENT_FROM_CUSTOM = 4

export function emptyMailAccount(): Omit<MailAccount, 'id'> {
	return {
		name: '',
		imap_server: '',
		imap_port: 993,
		imap_security: 2,
		username: '',
		password: '',
		character_set: 'UTF-8',
		is_token: false,
		account_type: 1,
	}
}

export function emptyMailRule(accountId?: number): Omit<MailRule, 'id'> {
	return {
		name: '',
		account: accountId ?? 0,
		enabled: true,
		order: 0,
		folder: 'INBOX',
		filter_from: '',
		filter_to: '',
		filter_subject: '',
		filter_body: '',
		filter_attachment_filename_include: '',
		filter_attachment_filename_exclude: '',
		maximum_age: 30,
		attachment_type: 1,
		consumption_scope: 1,
		pdf_layout: 0,
		action: 3,
		action_parameter: '',
		assign_title_from: 1,
		assign_tags: [],
		assign_document_type: null,
		assign_correspondent_from: 1,
		assign_correspondent: null,
		assign_owner_from_rule: true,
		stop_processing: false,
	}
}

export function isObfuscatedPassword(password?: string | null) {
	return Boolean(password) && /^\*+$/.test(password as string)
}

export function accountTypeLabel(type?: number) {
	return MAIL_ACCOUNT_TYPE.find((item) => item.id === type)?.label ?? 'IMAP'
}

export function ruleNeedsActionParameter(action?: number) {
	return action === MAIL_ACTION_MOVE || action === MAIL_ACTION_TAG
}

export function copyMailRule(rule: MailRule): Omit<MailRule, 'id'> {
	const copy: Omit<MailRule, 'id'> & { id?: number } = {
		...emptyMailRule(rule.account),
		...rule,
		name: `${rule.name} (copy)`,
	}
	delete copy.id
	return copy
}

export function accountPayload(
	account: Partial<MailAccount> & { id?: number }
) {
	const payload: Record<string, unknown> = {
		name: account.name,
		imap_server: account.imap_server,
		imap_port: account.imap_port || null,
		imap_security: account.imap_security,
		username: account.username,
		character_set: account.character_set || 'UTF-8',
		is_token: Boolean(account.is_token),
		account_type: account.account_type ?? 1,
	}
	if (account.id) payload.id = account.id
	if (account.password && !isObfuscatedPassword(account.password)) {
		payload.password = account.password
	} else if (account.password) {
		payload.password = account.password
	}
	return payload
}

export function validateMailAccount(
	account: Partial<MailAccount> & { id?: number }
) {
	if (!account.name?.trim()) return 'Name is required'
	if (!account.imap_server?.trim()) return 'IMAP server is required'
	if (!account.username?.trim()) return 'Username is required'
	if (!account.id && !account.password?.trim()) return 'Password is required'
	return null
}

export function validateMailRule(rule: Partial<MailRule> & { id?: number }) {
	if (!rule.name?.trim()) return 'Name is required'
	if (!rule.account) return 'Account is required'
	if (
		ruleNeedsActionParameter(rule.action) &&
		!rule.action_parameter?.trim()
	) {
		return rule.action === MAIL_ACTION_MOVE
			? 'Folder is required for move'
			: 'Tag name is required'
	}
	const age = rule.maximum_age
	if (age != null && (age < 0 || age > 36500)) {
		return 'Maximum age must be between 0 and 36500 days'
	}
	return null
}

export function rulePayload(rule: Partial<MailRule> & { id?: number }) {
	const payload: Record<string, unknown> = {
		name: rule.name,
		account: rule.account,
		enabled: rule.enabled ?? true,
		order: Number(rule.order ?? 0),
		folder: rule.folder || 'INBOX',
		filter_from: emptyToNull(rule.filter_from),
		filter_to: emptyToNull(rule.filter_to),
		filter_subject: emptyToNull(rule.filter_subject),
		filter_body: emptyToNull(rule.filter_body),
		filter_attachment_filename_include: emptyToNull(
			rule.filter_attachment_filename_include
		),
		filter_attachment_filename_exclude: emptyToNull(
			rule.filter_attachment_filename_exclude
		),
		maximum_age: Number(rule.maximum_age ?? 30),
		attachment_type: rule.attachment_type ?? 1,
		consumption_scope: rule.consumption_scope ?? 1,
		pdf_layout: rule.pdf_layout ?? 0,
		action: rule.action ?? 3,
		action_parameter: ruleNeedsActionParameter(rule.action)
			? rule.action_parameter
			: null,
		assign_title_from: rule.assign_title_from ?? 1,
		assign_tags: rule.assign_tags ?? [],
		assign_document_type: rule.assign_document_type || null,
		assign_correspondent_from: rule.assign_correspondent_from ?? 1,
		assign_correspondent:
			rule.assign_correspondent_from === CORRESPONDENT_FROM_CUSTOM
				? (rule.assign_correspondent ?? null)
				: null,
		assign_owner_from_rule: rule.assign_owner_from_rule ?? true,
		stop_processing: rule.stop_processing ?? false,
	}
	return payload
}

function emptyToNull(value?: string | null) {
	const trimmed = value?.trim()
	return trimmed ? trimmed : null
}
