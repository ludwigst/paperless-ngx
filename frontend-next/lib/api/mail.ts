import { apiFetch, toQuery } from '@/lib/api/client'
import type {
	MailAccount,
	MailRule,
	Paginated,
	ProcessedMail,
} from '@/types/paperless'

export function listMailAccounts() {
	return apiFetch<Paginated<MailAccount>>(
		`/api/paperless/mail_accounts/${toQuery({
			page: 1,
			page_size: 1000,
			ordering: 'name',
			full_perms: true,
		})}`
	)
}

export function createMailAccount(payload: Record<string, unknown>) {
	return apiFetch<MailAccount>('/api/paperless/mail_accounts/', {
		method: 'POST',
		body: JSON.stringify(payload),
	})
}

export function updateMailAccount(
	id: number,
	payload: Record<string, unknown>
) {
	return apiFetch<MailAccount>(`/api/paperless/mail_accounts/${id}/`, {
		method: 'PATCH',
		body: JSON.stringify(payload),
	})
}

export function deleteMailAccount(id: number) {
	return apiFetch<void>(`/api/paperless/mail_accounts/${id}/`, {
		method: 'DELETE',
	})
}

export function testMailAccount(payload: Record<string, unknown>) {
	return apiFetch<{ success?: boolean }>(
		'/api/paperless/mail_accounts/test/',
		{
			method: 'POST',
			body: JSON.stringify(payload),
		}
	)
}

export function processMailAccount(id: number) {
	return apiFetch<{ result?: string }>(
		`/api/paperless/mail_accounts/${id}/process/`,
		{ method: 'POST', body: JSON.stringify({}) }
	)
}

export function listMailRules() {
	return apiFetch<Paginated<MailRule>>(
		`/api/paperless/mail_rules/${toQuery({
			page: 1,
			page_size: 1000,
			ordering: 'order',
			full_perms: true,
		})}`
	)
}

export function createMailRule(payload: Record<string, unknown>) {
	return apiFetch<MailRule>('/api/paperless/mail_rules/', {
		method: 'POST',
		body: JSON.stringify(payload),
	})
}

export function updateMailRule(id: number, payload: Record<string, unknown>) {
	return apiFetch<MailRule>(`/api/paperless/mail_rules/${id}/`, {
		method: 'PATCH',
		body: JSON.stringify(payload),
	})
}

export function deleteMailRule(id: number) {
	return apiFetch<void>(`/api/paperless/mail_rules/${id}/`, {
		method: 'DELETE',
	})
}

export function listProcessedMail(ruleId: number, page = 1) {
	return apiFetch<Paginated<ProcessedMail>>(
		`/api/paperless/processed_mail/${toQuery({
			page,
			page_size: 50,
			ordering: '-processed',
			rule: ruleId,
		})}`
	)
}

export function bulkDeleteProcessedMail(mailIds: number[]) {
	return apiFetch<{ result?: string; deleted_mail_ids?: number[] }>(
		'/api/paperless/processed_mail/bulk_delete/',
		{
			method: 'POST',
			body: JSON.stringify({ mail_ids: mailIds }),
		}
	)
}
