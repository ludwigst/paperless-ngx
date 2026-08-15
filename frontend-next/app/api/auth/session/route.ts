import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { TOKEN_COOKIE } from '@/lib/auth/cookies'

export async function GET() {
	const store = await cookies()
	return NextResponse.json({
		authenticated: Boolean(store.get(TOKEN_COOKIE)?.value),
	})
}
