import {
	ApiError,
	formatApiErrorBody,
	messageForStatus,
} from '@/lib/api/errors'
import { parseChatResponse, type ParsedChatResponse } from '@/lib/utils/chat'

export async function streamChat(input: {
	q: string
	documentId?: number
	onChunk: (parsed: ParsedChatResponse) => void
	signal?: AbortSignal
}) {
	const response = await fetch('/api/paperless/documents/chat/', {
		method: 'POST',
		credentials: 'same-origin',
		headers: {
			Accept: 'text/event-stream, text/plain;q=0.9, */*;q=0.8',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			q: input.q,
			...(input.documentId ? { document_id: input.documentId } : {}),
		}),
		signal: input.signal,
	})

	if (!response.ok) {
		const contentType = response.headers.get('content-type') ?? ''
		const body = contentType.includes('application/json')
			? await response.json().catch(() => null)
			: await response.text()
		throw new ApiError(
			response.status,
			messageForStatus(response.status, formatApiErrorBody(body)),
			body
		)
	}

	if (!response.body) {
		throw new ApiError(502, 'The chat stream was empty.')
	}

	const reader = response.body.getReader()
	const decoder = new TextDecoder()
	let acc = ''
	while (true) {
		const { done, value } = await reader.read()
		if (done) break
		acc += decoder.decode(value, { stream: true })
		input.onChunk(parseChatResponse(acc))
	}
}
