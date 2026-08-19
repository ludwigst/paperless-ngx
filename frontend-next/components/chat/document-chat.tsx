'use client'

import { MessageSquare, Send } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from '@/components/ui/input-group'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { streamChat } from '@/lib/api/chat'
import { cn } from '@/lib/utils'
import { documentIdFromPath, type ChatReference } from '@/lib/utils/chat'

interface ChatMessage {
	role: 'user' | 'assistant'
	content: string
	isStreaming?: boolean
	references?: ChatReference[]
}

export function DocumentChat() {
	const pathname = usePathname()
	const documentId = documentIdFromPath(pathname)
	const [open, setOpen] = useState(false)
	const [input, setInput] = useState('')
	const [loading, setLoading] = useState(false)
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const scroller = useRef<HTMLDivElement>(null)
	const field = useRef<HTMLInputElement>(null)

	function scrollToEnd() {
		const node = scroller.current
		if (node) node.scrollTop = node.scrollHeight
	}

	async function send() {
		const q = input.trim()
		if (!q || loading) return
		setInput('')
		setMessages((current) => [
			...current,
			{ role: 'user', content: q },
			{ role: 'assistant', content: '', isStreaming: true },
		])
		setLoading(true)
		scrollToEnd()
		try {
			await streamChat({
				q,
				documentId,
				onChunk: (parsed) => {
					setMessages((current) => {
						const next = [...current]
						const last = next[next.length - 1]
						if (last?.role === 'assistant') {
							next[next.length - 1] = {
								...last,
								content: parsed.content,
								references: parsed.references,
							}
						}
						return next
					})
					scrollToEnd()
				},
			})
		} catch (error) {
			setMessages((current) => {
				const next = [...current]
				const last = next[next.length - 1]
				if (last?.role === 'assistant') {
					next[next.length - 1] = {
						...last,
						content: `${last.content}\n\nCould not receive a reply.${error instanceof Error ? ` ${error.message}` : ''}`,
						isStreaming: false,
					}
				}
				return next
			})
		} finally {
			setLoading(false)
			setMessages((current) =>
				current.map((message, index) =>
					index === current.length - 1
						? { ...message, isStreaming: false }
						: message
				)
			)
			scrollToEnd()
		}
	}

	return (
		<Popover
			open={open}
			onOpenChange={(next) => {
				setOpen(next)
				if (next) {
					window.setTimeout(() => field.current?.focus(), 10)
				}
			}}
		>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					aria-label={
						documentId ? 'Ask about this document' : 'Ask about your documents'
					}
				>
					<MessageSquare className="size-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-[22rem] gap-0 p-0 sm:w-96">
				<div className="border-b px-3 py-2">
					<p className="font-heading text-sm">Ask the archive</p>
					<p className="text-xs text-muted-foreground">
						{documentId
							? 'Questions are scoped to this document.'
							: 'Questions search documents you can view.'}
					</p>
				</div>
				<div
					ref={scroller}
					className="flex max-h-80 min-h-40 flex-col gap-2 overflow-y-auto p-3 font-mono text-xs"
				>
					{messages.length === 0 ? (
						<p className="text-muted-foreground">
							Ask a question
							{documentId ? ' about this document' : ' about a document'}.
						</p>
					) : null}
					{messages.map((message, index) => (
						<div
							key={`${message.role}-${index}`}
							className={cn(
								'max-w-[95%] rounded-lg px-2.5 py-2 whitespace-pre-wrap',
								message.role === 'user' ? 'ml-auto bg-secondary' : 'bg-muted/60'
							)}
						>
							{message.content}
							{message.isStreaming ? (
								<span className="ms-0.5 inline-block animate-pulse">|</span>
							) : null}
							{message.role === 'assistant' && message.references?.length ? (
								<ul className="mt-2 space-y-1 font-sans">
									{message.references.map((reference) => (
										<li key={reference.id}>
											<Link
												href={`/documents/${reference.id}`}
												className="text-primary hover:underline"
												onClick={() => setOpen(false)}
											>
												{reference.title}
											</Link>
										</li>
									))}
								</ul>
							) : null}
						</div>
					))}
				</div>
				<form
					className="border-t p-2"
					onSubmit={(event) => {
						event.preventDefault()
						void send()
					}}
				>
					<InputGroup>
						<InputGroupInput
							ref={field}
							value={input}
							disabled={loading}
							placeholder={
								documentId
									? 'Ask a question about this document…'
									: 'Ask a question about a document…'
							}
							onChange={(event) => setInput(event.target.value)}
						/>
						<InputGroupAddon align="inline-end">
							<InputGroupButton
								type="submit"
								variant="ghost"
								size="icon-xs"
								disabled={loading || !input.trim()}
								aria-label="Send"
							>
								<Send />
							</InputGroupButton>
						</InputGroupAddon>
					</InputGroup>
				</form>
			</PopoverContent>
		</Popover>
	)
}
