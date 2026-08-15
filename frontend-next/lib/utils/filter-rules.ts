import type { FilterRule } from '@/types/paperless'

export const NEGATIVE_NULL_FILTER_VALUE = -1

export interface FilterRuleType {
	id: number
	filtervar: string
	isnull_filtervar?: string
	datatype: 'string' | 'number' | 'boolean' | 'date'
	multi: boolean
}

export const FILTER_RULE_TYPES: FilterRuleType[] = [
	{ id: 0, filtervar: 'title__icontains', datatype: 'string', multi: false },
	{ id: 48, filtervar: 'title_search', datatype: 'string', multi: false },
	{ id: 1, filtervar: 'content__icontains', datatype: 'string', multi: false },
	{
		id: 2,
		filtervar: 'archive_serial_number',
		datatype: 'number',
		multi: false,
	},
	{
		id: 3,
		filtervar: 'correspondent__id',
		isnull_filtervar: 'correspondent__isnull',
		datatype: 'number',
		multi: false,
	},
	{
		id: 26,
		filtervar: 'correspondent__id__in',
		datatype: 'number',
		multi: true,
	},
	{
		id: 27,
		filtervar: 'correspondent__id__none',
		datatype: 'number',
		multi: true,
	},
	{
		id: 25,
		filtervar: 'storage_path__id',
		isnull_filtervar: 'storage_path__isnull',
		datatype: 'number',
		multi: false,
	},
	{
		id: 30,
		filtervar: 'storage_path__id__in',
		datatype: 'number',
		multi: true,
	},
	{
		id: 31,
		filtervar: 'storage_path__id__none',
		datatype: 'number',
		multi: true,
	},
	{
		id: 4,
		filtervar: 'document_type__id',
		isnull_filtervar: 'document_type__isnull',
		datatype: 'number',
		multi: false,
	},
	{
		id: 28,
		filtervar: 'document_type__id__in',
		datatype: 'number',
		multi: true,
	},
	{
		id: 29,
		filtervar: 'document_type__id__none',
		datatype: 'number',
		multi: true,
	},
	{ id: 5, filtervar: 'is_in_inbox', datatype: 'boolean', multi: false },
	{ id: 6, filtervar: 'tags__id__all', datatype: 'number', multi: true },
	{ id: 22, filtervar: 'tags__id__in', datatype: 'number', multi: true },
	{ id: 17, filtervar: 'tags__id__none', datatype: 'number', multi: true },
	{ id: 7, filtervar: 'is_tagged', datatype: 'boolean', multi: false },
	{ id: 8, filtervar: 'created__date__lt', datatype: 'date', multi: false },
	{ id: 9, filtervar: 'created__date__gt', datatype: 'date', multi: false },
	{ id: 43, filtervar: 'created__date__lte', datatype: 'date', multi: false },
	{ id: 44, filtervar: 'created__date__gte', datatype: 'date', multi: false },
	{ id: 10, filtervar: 'created__year', datatype: 'number', multi: false },
	{ id: 11, filtervar: 'created__month', datatype: 'number', multi: false },
	{ id: 12, filtervar: 'created__day', datatype: 'number', multi: false },
	{ id: 13, filtervar: 'added__date__lt', datatype: 'date', multi: false },
	{ id: 14, filtervar: 'added__date__gt', datatype: 'date', multi: false },
	{ id: 45, filtervar: 'added__date__lte', datatype: 'date', multi: false },
	{ id: 46, filtervar: 'added__date__gte', datatype: 'date', multi: false },
	{ id: 15, filtervar: 'modified__date__lt', datatype: 'date', multi: false },
	{ id: 16, filtervar: 'modified__date__gt', datatype: 'date', multi: false },
	{
		id: 18,
		filtervar: 'archive_serial_number__isnull',
		datatype: 'boolean',
		multi: false,
	},
	{
		id: 23,
		filtervar: 'archive_serial_number__gt',
		datatype: 'number',
		multi: false,
	},
	{
		id: 24,
		filtervar: 'archive_serial_number__lt',
		datatype: 'number',
		multi: false,
	},
	{ id: 19, filtervar: 'title_content', datatype: 'string', multi: false },
	{ id: 49, filtervar: 'text', datatype: 'string', multi: false },
	{ id: 20, filtervar: 'query', datatype: 'string', multi: false },
	{ id: 21, filtervar: 'more_like_id', datatype: 'number', multi: false },
	{ id: 32, filtervar: 'owner__id', datatype: 'number', multi: false },
	{ id: 33, filtervar: 'owner__id__in', datatype: 'number', multi: true },
	{ id: 34, filtervar: 'owner__isnull', datatype: 'boolean', multi: false },
	{ id: 35, filtervar: 'owner__id__none', datatype: 'number', multi: true },
	{ id: 37, filtervar: 'shared_by__id', datatype: 'number', multi: true },
	{
		id: 36,
		filtervar: 'custom_fields__icontains',
		datatype: 'string',
		multi: false,
	},
	{
		id: 38,
		filtervar: 'custom_fields__id__all',
		datatype: 'number',
		multi: true,
	},
	{
		id: 39,
		filtervar: 'custom_fields__id__in',
		datatype: 'number',
		multi: true,
	},
	{
		id: 40,
		filtervar: 'custom_fields__id__none',
		datatype: 'number',
		multi: true,
	},
	{
		id: 41,
		filtervar: 'has_custom_fields',
		datatype: 'boolean',
		multi: false,
	},
	{
		id: 42,
		filtervar: 'custom_field_query',
		datatype: 'string',
		multi: false,
	},
	{ id: 47, filtervar: 'mime_type', datatype: 'string', multi: false },
]

const TITLE_RULES = new Set([0, 48])
const TEXT_RULES = new Set([1, 19, 49])

export function queryParamsFromFilterRules(
	filterRules: FilterRule[] | undefined
): Record<string, string | number | boolean> {
	if (!filterRules?.length) return {}
	const params: Record<string, string | number | boolean> = {}
	for (const rule of filterRules) {
		const ruleType = FILTER_RULE_TYPES.find(
			(item) => item.id === rule.rule_type
		)
		if (!ruleType) continue
		if (TITLE_RULES.has(rule.rule_type)) {
			params.title_search = rule.value
			continue
		}
		if (TEXT_RULES.has(rule.rule_type)) {
			params.text = rule.value
			continue
		}
		if (
			ruleType.isnull_filtervar &&
			(rule.value == null || rule.value === '')
		) {
			params[ruleType.isnull_filtervar] = 1
			continue
		}
		if (
			ruleType.isnull_filtervar &&
			rule.value === String(NEGATIVE_NULL_FILTER_VALUE)
		) {
			params[ruleType.isnull_filtervar] = 0
			continue
		}
		if (ruleType.multi) {
			const existing = params[ruleType.filtervar]
			params[ruleType.filtervar] = existing
				? `${existing},${rule.value}`
				: rule.value
			continue
		}
		if (ruleType.datatype === 'boolean') {
			params[ruleType.filtervar] =
				rule.value === 'true' || rule.value === '1' ? 1 : 0
			continue
		}
		params[ruleType.filtervar] = rule.value
	}
	return params
}

export function filterRulesFromQuery(
	query: Record<string, string | number | boolean>
): FilterRule[] {
	const rules: FilterRule[] = []
	for (const [key, raw] of Object.entries(query)) {
		const ruleType = FILTER_RULE_TYPES.find(
			(item) => item.filtervar === key || item.isnull_filtervar === key
		)
		if (!ruleType) continue
		const isNull = ruleType.isnull_filtervar === key
		const value = String(raw)
		if (isNull) {
			rules.push({
				rule_type: ruleType.id,
				value:
					value === '1' || value === 'true'
						? ''
						: String(NEGATIVE_NULL_FILTER_VALUE),
			})
			continue
		}
		if (ruleType.multi) {
			for (const part of value.split(',').filter(Boolean)) {
				rules.push({ rule_type: ruleType.id, value: part })
			}
			continue
		}
		if (ruleType.datatype === 'boolean') {
			rules.push({
				rule_type: ruleType.id,
				value: value === '1' || value === 'true' ? 'true' : 'false',
			})
			continue
		}
		rules.push({ rule_type: ruleType.id, value })
	}
	return rules
}
