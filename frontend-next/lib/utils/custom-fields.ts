import { CustomFieldDataType, type CustomField } from '@/types/paperless'

export function displayCustomFieldValue(value: unknown) {
	if (value == null || value === '') return ''
	if (Array.isArray(value)) return value.join(', ')
	if (typeof value === 'boolean') return value ? 'true' : 'false'
	return String(value)
}

export function parseCustomFieldValue(
	dataType: CustomFieldDataType | string,
	raw: string
): unknown {
	const trimmed = raw.trim()
	if (trimmed === '') return null
	switch (dataType) {
		case CustomFieldDataType.Boolean:
			return trimmed === 'true' || trimmed === '1'
		case CustomFieldDataType.Integer:
			return Number.parseInt(trimmed, 10)
		case CustomFieldDataType.Float:
		case CustomFieldDataType.Monetary:
			return Number.parseFloat(trimmed)
		case CustomFieldDataType.DocumentLink:
			return trimmed
				.split(/[\s,]+/)
				.map(Number)
				.filter((id) => Number.isFinite(id))
		default:
			return raw
	}
}

export function customFieldInputKind(
	field: Pick<CustomField, 'data_type'>
): 'boolean' | 'select' | 'textarea' | 'date' | 'number' | 'text' {
	switch (field.data_type) {
		case CustomFieldDataType.Boolean:
			return 'boolean'
		case CustomFieldDataType.Select:
			return 'select'
		case CustomFieldDataType.LongText:
			return 'textarea'
		case CustomFieldDataType.Date:
			return 'date'
		case CustomFieldDataType.Integer:
		case CustomFieldDataType.Float:
		case CustomFieldDataType.Monetary:
			return 'number'
		default:
			return 'text'
	}
}

export function summarizeHistoryChange(key: string, value: unknown) {
	if (value && typeof value === 'object' && !Array.isArray(value)) {
		const record = value as Record<string, unknown>
		if (record.type === 'm2m') {
			const objects = Array.isArray(record.objects)
				? record.objects.map(String).join(', ')
				: ''
			return `${String(record.operation ?? 'changed')} ${key}: ${objects}`
		}
		if (record.type === 'custom_field') {
			return `${String(record.field ?? key)}: ${String(record.value ?? '')}`
		}
	}
	if (Array.isArray(value)) {
		const next = value[1]
		const shown =
			key === 'content' && typeof next === 'string'
				? `${next.slice(0, 100)}…`
				: String(next ?? '')
		return `${key}: ${shown}`
	}
	return `${key}: ${String(value ?? '')}`
}
