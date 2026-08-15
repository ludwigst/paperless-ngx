import { NextRequest, NextResponse } from 'next/server'

import {
	formatApiErrorBody,
	isMfaRequired,
	messageForStatus,
} from '@/lib/api/errors'
import {
	API_VERSION,
	TOKEN_COOKIE,
	paperlessBackendUrl,
	tokenCookieOptions,
} from '@/lib/auth/cookies'

export async function POST(request: NextRequest) {
	const body = (await request.json().catch(() => null)) as {
		username?: string
		password?: string
		code?: string
	} | null

	if (!body?.username || !body.password) {
		return NextResponse.json(
			{ detail: 'Username and password are required.' },
			{ status: 400 }
		)
	}

	const payload: Record<string, string> = {
		username: body.username,
		password: body.password,
	}
	if (body.code) payload.code = body.code

	const response = await fetch(`${paperlessBackendUrl()}/api/token/`, {
		method: 'POST',
		headers: {
			Accept: `application/json; version=${API_VERSION}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	})

	const data = await response.json().catch(() => null)

	if (!response.ok) {
		const mfa = isMfaRequired(data)
		return NextResponse.json(
			{
				detail: messageForStatus(response.status, formatApiErrorBody(data)),
				mfa_required: mfa,
				details: data,
			},
			{ status: response.status }
		)
	}

	const token = data?.token
	if (typeof token !== 'string' || !token) {
		return NextResponse.json(
			{ detail: 'Login succeeded but no token was returned.' },
			{ status: 502 }
		)
	}

	const next = NextResponse.json({ ok: true })
	next.cookies.set(TOKEN_COOKIE, token, tokenCookieOptions())
	return next
}
