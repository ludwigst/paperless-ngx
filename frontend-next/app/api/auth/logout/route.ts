import { NextResponse } from "next/server"

import { TOKEN_COOKIE } from "@/lib/auth/cookies"

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(TOKEN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
  return response
}
