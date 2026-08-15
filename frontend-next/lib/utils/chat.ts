export const CHAT_METADATA_DELIMITER = '\n\n__PAPERLESS_CHAT_METADATA__'

export interface ChatReference {
	id: number
	title: string
}

export interface ParsedChatResponse {
	content: string
	references?: ChatReference[]
}

export function parseChatResponse(response: string): ParsedChatResponse {
	const delimiterIndex = response.indexOf(CHAT_METADATA_DELIMITER)
	if (delimiterIndex === -1) return { content: response }

	const metadataString = response.slice(
		delimiterIndex + CHAT_METADATA_DELIMITER.length
	)
	try {
		const metadata = JSON.parse(metadataString) as {
			references?: ChatReference[]
		}
		return {
			content: response.slice(0, delimiterIndex),
			references: metadata.references ?? [],
		}
	} catch {
		return { content: response.slice(0, delimiterIndex) }
	}
}

export function documentIdFromPath(pathname: string) {
	const match = pathname.match(/^\/documents\/(\d+)(?:\/|$)/)
	return match ? Number(match[1]) : undefined
}

export function isAiEnabled(settings?: Record<string, unknown>) {
	return settings?.ai_enabled === true
}

export function hasInboxTag(
	tagIds: number[] | undefined,
	tags: Array<{ id: number; is_inbox_tag?: boolean }>
) {
	return Boolean(
		tagIds?.some(
			(id) => tags.find((tag) => tag.id === id)?.is_inbox_tag
		)
	)
}
