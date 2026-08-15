import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { buildPaperlessProxyUrl } from '@/lib/api/proxy'
import {
	API_VERSION,
	TOKEN_COOKIE,
	paperlessBackendUrl,
} from '@/lib/auth/cookies'

async function proxyRequest(request: NextRequest, path: string[]) {
	const store = await cookies()
	const token = store.get(TOKEN_COOKIE)?.value
	if (!token) {
		return NextResponse.json(
			{ detail: 'Authentication required.' },
			{ status: 401 }
		)
	}

	const target = buildPaperlessProxyUrl(
		paperlessBackendUrl(),
		path,
		request.nextUrl.search
	)
	if (!target) {
		return NextResponse.json({ detail: 'Invalid API path.' }, { status: 400 })
	}

	const headers = new Headers()
	headers.set('Authorization', `Token ${token}`)
	headers.set(
		'Accept',
		request.headers.get('accept') ?? `application/json; version=${API_VERSION}`
	)

	const contentType = request.headers.get('content-type')
	if (contentType) headers.set('Content-Type', contentType)

	const method = request.method
	const body =
		method === 'GET' || method === 'HEAD'
			? undefined
			: Buffer.from(await request.arrayBuffer())

	const upstream = await fetch(target, {
		method,
		headers,
		body,
		redirect: 'manual',
	})

	const responseHeaders = new Headers()
	const pass = [
		'content-type',
		'content-disposition',
		'content-length',
		'cache-control',
	]
	for (const name of pass) {
		const value = upstream.headers.get(name)
		if (value) responseHeaders.set(name, value)
	}

	return new NextResponse(upstream.body, {
		status: upstream.status,
		headers: responseHeaders,
	})
}

export async function GET(
	request: NextRequest,
	context: { params: Promise<{ path: string[] }> }
) {
	const { path } = await context.params
	return proxyRequest(request, path)
}

export const POST = GET
export const PUT = GET
export const PATCH = GET
export const DELETE = GET
