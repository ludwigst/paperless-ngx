export const BULK_CONFIRM_SETTING =
	'general-settings:bulk-edit:confirmation-dialogs'

export function wantsBulkConfirmation(settings?: Record<string, unknown>) {
	return settings?.[BULK_CONFIRM_SETTING] !== false
}

export function listNames(names: string[]) {
	if (names.length === 0) return ''
	if (names.length === 1) return `"${names[0]}"`
	if (names.length === 2) return `"${names[0]}" and "${names[1]}"`
	return `${names
		.slice(0, -1)
		.map((name) => `"${name}"`)
		.join(', ')}, and "${names[names.length - 1]}"`
}

export function bulkTagsMessage(
	count: number,
	addNames: string[],
	removeNames: string[]
) {
	const docs = `${count} selected document${count === 1 ? '' : 's'}`
	if (addNames.length && !removeNames.length) {
		return `This will add ${addNames.length === 1 ? 'the tag' : 'the tags'} ${listNames(addNames)} to ${docs}.`
	}
	if (!addNames.length && removeNames.length) {
		return `This will remove ${removeNames.length === 1 ? 'the tag' : 'the tags'} ${listNames(removeNames)} from ${docs}.`
	}
	return `This will add ${listNames(addNames)} and remove ${listNames(removeNames)} on ${docs}.`
}

export function bulkAssignMessage(
	kind: 'correspondent' | 'document type' | 'storage path',
	count: number,
	name?: string | null
) {
	const docs = `${count} selected document${count === 1 ? '' : 's'}`
	if (name) {
		return `This will assign the ${kind} "${name}" to ${docs}.`
	}
	return `This will remove the ${kind} from ${docs}.`
}
